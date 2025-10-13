"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Loader2, Eye, X, Bold, Italic, Underline, Link2, List, ListOrdered, AlignLeft, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { News, CreateNewsData } from '@/types/dashboard/content';
import { getNews, createNews, updateNews, deleteNews } from '@/app/api/dashboard/content';
import NewsList from './list';

const INITIAL_FORM: CreateNewsData = {
  title: "",
  excerpt: "",
  content: "",
  author: "",
  author_role: "",
  featured: false,
  published: false,
  date: "",
  category: "",
  tags: "",
  image: null
};

const NewsPage: React.FC = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [formData, setFormData] = useState<CreateNewsData>(INITIAL_FORM);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const contentEditableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await getNews();
      setNews(response.results || []);
    } catch (err) {
      setError('Failed to fetch news articles');
    } finally {
      setLoading(false);
    }
  };

  const uniqueCategories = [...new Set(news.map(n => n.category).filter((cat): cat is string => Boolean(cat)))];

  const filteredNews = news.filter(article => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || 
      article.title.toLowerCase().includes(query) ||
      article.content.toLowerCase().includes(query) ||
      article.author?.toLowerCase().includes(query) ||
      article.category?.toLowerCase().includes(query) ||
      article.tags?.toLowerCase().includes(query);

    const matchesCategory = categoryFilter === "all" || article.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "published" && article.published) ||
      (statusFilter === "draft" && !article.published) ||
      (statusFilter === "featured" && article.featured);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const extractTagsFromContent = (content: string): string => {
    const keywords = new Set<string>();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const text = tempDiv.textContent || '';
    
    const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const commonWords = new Set(['this', 'that', 'with', 'from', 'have', 'been', 'will', 'your', 'what', 'when', 'where', 'which', 'their', 'there', 'about', 'would', 'could', 'should', 'these', 'those']);
    
    words.forEach(word => {
      if (!commonWords.has(word)) {
        keywords.add(word);
      }
    });
    
    return Array.from(keywords).slice(0, 5).join(', ');
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      const content = contentEditableRef.current?.innerHTML || '';
      const autoTags = extractTagsFromContent(content);
      const submitData = { ...formData, content, tags: autoTags };
      const newArticle = await createNews(submitData);
      setNews(prev => [newArticle, ...prev]);
      setFormData(INITIAL_FORM);
      if (contentEditableRef.current) contentEditableRef.current.innerHTML = '';
      setIsCreateOpen(false);
    } catch (err) {
      setError('Failed to create news article');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (article: News) => {
    setSelectedNews(article);
    setFormData({
      title: article.title,
      excerpt: article.excerpt || "",
      content: article.content || "",
      author: article.author || "",
      author_role: article.author_role || "",
      featured: article.featured,
      published: article.published,
      date: article.date || "",
      category: article.category || "",
      tags: article.tags || "",
      image: null
    });
    setIsEditOpen(true);
    setTimeout(() => {
      if (contentEditableRef.current) {
        contentEditableRef.current.innerHTML = article.content || '';
      }
    }, 100);
  };

  const handleUpdate = async () => {
    if (!selectedNews) return;
    try {
      setLoading(true);
      const content = contentEditableRef.current?.innerHTML || '';
      const autoTags = extractTagsFromContent(content);
      const submitData = { ...formData, content, tags: autoTags };
      const updated = await updateNews(selectedNews.id, submitData);
      setNews(prev => prev.map(n => n.id === selectedNews.id ? updated : n));
      setIsEditOpen(false);
      setSelectedNews(null);
    } catch (err) {
      setError('Failed to update news article');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNews(id);
      setNews(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      setError('Failed to delete news article');
    }
  };

  const handleView = (article: News) => {
    setSelectedNews(article);
    setIsViewOpen(true);
  };

  const updateFormData = (field: keyof CreateNewsData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (file: File | null) => {
    setFormData(prev => ({ ...prev, image: file }));
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setSelectedNews(null);
    setPreviewMode(false);
    if (contentEditableRef.current) contentEditableRef.current.innerHTML = '';
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    contentEditableRef.current?.focus();
  };

  const insertLink = () => {
    const url = window.prompt('Enter URL:', 'https://');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = window.prompt('Enter image URL:', 'https://');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const renderFormContent = (isEdit = false) => (
    <div className="space-y-4">
      <div>
        <Label>Title *</Label>
        <Input 
          value={formData.title} 
          onChange={(e) => updateFormData('title', e.target.value)} 
          placeholder="Enter article title"
          className="text-lg font-semibold"
        />
      </div>
      
      <div>
        <Label>Excerpt</Label>
        <Textarea 
          value={formData.excerpt} 
          onChange={(e) => updateFormData('excerpt', e.target.value)} 
          rows={2}
          placeholder="Brief summary (max 500 characters)"
          maxLength={500}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Content *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-1" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
        </div>
        
        {!previewMode ? (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 border-b p-2 flex gap-1 flex-wrap">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => execCommand('bold')}
                title="Bold (Ctrl+B)"
                className="hover:bg-gray-200"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => execCommand('italic')}
                title="Italic (Ctrl+I)"
                className="hover:bg-gray-200"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => execCommand('underline')}
                title="Underline (Ctrl+U)"
                className="hover:bg-gray-200"
              >
                <Underline className="h-4 w-4" />
              </Button>
              <div className="w-px bg-gray-300 mx-1"></div>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => execCommand('insertUnorderedList')}
                title="Bullet List"
                className="hover:bg-gray-200"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => execCommand('insertOrderedList')}
                title="Numbered List"
                className="hover:bg-gray-200"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <div className="w-px bg-gray-300 mx-1"></div>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={insertLink}
                title="Insert Link"
                className="hover:bg-gray-200"
              >
                <Link2 className="h-4 w-4" />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={insertImage}
                title="Insert Image"
                className="hover:bg-gray-200"
              >
                <ImagePlus className="h-4 w-4" />
              </Button>
              <div className="w-px bg-gray-300 mx-1"></div>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => execCommand('formatBlock', '<h2>')}
                title="Heading"
                className="hover:bg-gray-200 font-semibold"
              >
                H2
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => execCommand('formatBlock', '<h3>')}
                title="Subheading"
                className="hover:bg-gray-200 font-semibold"
              >
                H3
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => execCommand('formatBlock', '<p>')}
                title="Paragraph"
                className="hover:bg-gray-200"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
            </div>
            <div
              ref={contentEditableRef}
              contentEditable
              className="min-h-[300px] p-4 focus:outline-none prose max-w-none"
              style={{
                minHeight: '300px',
              }}
            />
          </div>
        ) : (
          <div 
            className="border rounded-lg p-4 min-h-[300px] bg-gray-50 prose max-w-none"
            dangerouslySetInnerHTML={{ __html: contentEditableRef.current?.innerHTML || '' }}
          />
        )}
     
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Author</Label>
          <Input 
            value={formData.author} 
            onChange={(e) => updateFormData('author', e.target.value)} 
            placeholder="Author name"
          />
        </div>
        <div>
          <Label>Author Role</Label>
          <Input 
            value={formData.author_role} 
            onChange={(e) => updateFormData('author_role', e.target.value)} 
            placeholder="e.g., Editor, Reporter"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Category</Label>
          <Input 
            value={formData.category} 
            onChange={(e) => updateFormData('category', e.target.value)} 
            placeholder="e.g., Technology, Health"
          />
        </div>
        <div>
          <Label>Date</Label>
          <Input 
            type="date"
            value={formData.date} 
            onChange={(e) => updateFormData('date', e.target.value)} 
          />
        </div>
      </div>

      <div>
        <Label>Featured Image</Label>
        <Input 
          type="file" 
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)} 
        />
        {isEdit && selectedNews?.image && (
          <p className="text-xs text-gray-500 mt-1">
            Current image: {selectedNews.image}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Switch 
            checked={formData.published} 
            onCheckedChange={(checked) => updateFormData('published', checked)} 
          />
          <Label>Publish article</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            checked={formData.featured} 
            onCheckedChange={(checked) => updateFormData('featured', checked)} 
          />
          <Label>Feature article</Label>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={() => { 
          isEdit ? setIsEditOpen(false) : setIsCreateOpen(false); 
          resetForm(); 
        }}>
          Cancel
        </Button>
        <Button 
          onClick={isEdit ? handleUpdate : handleCreate} 
          disabled={!formData.title || !contentEditableRef.current?.innerHTML}
          className="bg-[#27aae1] hover:bg-[#1e90c7]"
        >
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEdit ? 'Update Article' : 'Create Article'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="lg:p-6 p-0 space-y-6">
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading news articles...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">News Management</h1>
          <p className="text-gray-600 mt-2">Create and manage news articles with professional editing</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#27aae1] hover:bg-[#1e90c7]">
              <Plus className="h-4 w-4 mr-2" />Add Article
            </Button>
          </DialogTrigger>
          <DialogContent className="min-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Article</DialogTitle>
            </DialogHeader>
            {renderFormContent(false)}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search articles..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!loading && (
        <NewsList 
          news={filteredNews}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Article Details</DialogTitle>
          </DialogHeader>
          {selectedNews && (
            <div className="space-y-4">
              {selectedNews.image && (
                <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">
                  <img 
                    src={selectedNews.image} 
                    alt={selectedNews.title}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
              
              <div>
                <h3 className="text-2xl font-bold">{selectedNews.title}</h3>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {selectedNews.category && (
                    <span className="px-2 py-1 bg-blue-100 rounded text-xs">{selectedNews.category}</span>
                  )}
                  {selectedNews.published ? (
                    <span className="px-2 py-1 bg-green-100 rounded text-xs">Published</span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">Draft</span>
                  )}
                  {selectedNews.featured && (
                    <span className="px-2 py-1 bg-amber-100 rounded text-xs">Featured</span>
                  )}
                </div>
              </div>

              {selectedNews.excerpt && (
                <div>
                  <h4 className="font-medium mb-2">Excerpt</h4>
                  <p className="text-gray-700 italic">{selectedNews.excerpt}</p>
                </div>
              )}
              
              <div>
                <h4 className="font-medium mb-2">Content</h4>
                <div 
                  className="bg-gray-50 p-4 rounded prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedNews.content }}
                />
              </div>

              {selectedNews.tags && (
                <div>
                  <h4 className="font-medium mb-2"> Tags</h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedNews.tags.split(',').map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-100 rounded text-xs">{tag.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Author Details</h4>
                  <div className="space-y-1">
                    <div>Author: {selectedNews.author || 'N/A'}</div>
                    <div>Role: {selectedNews.author_role || 'N/A'}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Publication Details</h4>
                  <div className="space-y-1">
                    <div>Date: {selectedNews.date || 'N/A'}</div>
                    <div>Created: {new Date(selectedNews.created_at).toLocaleDateString()}</div>
                    <div>Updated: {new Date(selectedNews.updated_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="min-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
          </DialogHeader>
          {renderFormContent(true)}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsPage;