// "use client";

// import React, { useState, useEffect } from 'react';
// import { useRouter, useParams } from 'next/navigation';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   ArrowLeft,
//   User,
//   Building,
//   Mail,
//   Phone,
//   MapPin,
//   Calendar,
//   FileText,
//   Briefcase,
//   Edit,
//   Download,
//   ExternalLink,
//   AlertCircle
// } from "lucide-react";
// import { format } from "date-fns";
// import type { SubmittedProposal } from '@/types/dashboard/submittedProposals';

// import { getSubmittedProposals } from '@/app/api/dashboard/submitted-proposals';  


// export default function TrackerDetailPage() {
//   const router = useRouter();
//   const params = useParams();
//   const trackerId = params?.id as string;
  
//   const [tracker, setTracker] = useState<SubmittedProposal | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     if (trackerId) {
//       fetchTracker();
//     }
//   }, [trackerId]);

//   const fetchTracker = async () => {
//     try {
//       setLoading(true);
//       setError('');
//       const proposals = await getSubmittedProposals();
//       const data = proposals.results.find((proposal: SubmittedProposal) => String(proposal.id) === trackerId);
      
//       if (!data) {
//         throw new Error(`No proposal found with ID: ${trackerId}`);
//       }
      
    
//       setTracker(data);
//     } catch (err) {
//       setError('Failed to load intervention details');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="p-6">
//         <Card className="animate-pulse">
//           <CardContent className="p-6">
//             <div className="h-64 bg-gray-200 rounded"></div>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   if (error || !tracker) {
//     return (
//       <div className="p-6">
//         <Card className="border-red-200 bg-red-50">
//           <CardContent className="p-12 text-center">
//             <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
//             <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Intervention</h3>
//             <p className="text-red-700 mb-4">{error || 'Intervention not found'}</p>
//             <Button onClick={() => router.back()} variant="outline">
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Go Back
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 p-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//         <div className="flex items-start gap-4">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => router.back()}
//           >
//             <ArrowLeft className="h-4 w-4" />
//           </Button>
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">
//               {tracker.beneficiary || 'Untitled Intervention'}
//             </h1>
//             <p className="text-sm text-gray-600 font-mono mt-1">
//               {tracker.reference_number}
//             </p>
//           </div>
//         </div>
        
//         <div className="flex gap-2">
//           <Button variant="outline" size="sm">
//             <Edit className="h-4 w-4 mr-2" />
//             Edit
//           </Button>
//           <Button variant="outline" size="sm">
//             <Download className="h-4 w-4 mr-2" />
//             Export
//           </Button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 gap-6">
//         {/* Main Info */}
//         <div className="lg:col-span-2 space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Justification</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <p className="text-gray-700 leading-relaxed">
//                 {tracker.justification}
//               </p>
//             </CardContent>
//           </Card>

//           {tracker.expected_impact && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>Expected Impact</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <p className="text-gray-700 leading-relaxed">
//                   {tracker.expected_impact}
//                 </p>
//               </CardContent>
//             </Card>
//           )}

//           {tracker.additional_info && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>Additional Information</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <p className="text-gray-700 leading-relaxed">
//                   {tracker.additional_info}
//                 </p>
//               </CardContent>
//             </Card>
//           )}
//         </div>

//         {/* Sidebar */}
//         <div className="space-y-6">
//           {/* Submitter Info */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-base">Submitter Information</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               <div className="flex items-center gap-2 text-sm">
//                 <User className="h-4 w-4 text-gray-400" />
//                 <span className="font-medium">{tracker.name}</span>
//               </div>
//               <div className="flex items-center gap-2 text-sm">
//                 <Building className="h-4 w-4 text-gray-400" />
//                 <span className="text-gray-600">{tracker.organization}</span>
//               </div>
//               <div className="flex items-center gap-2 text-sm">
//                 <Briefcase className="h-4 w-4 text-gray-400" />
//                 <span className="text-gray-600">{tracker.profession}</span>
//               </div>
//               <div className="flex items-center gap-2 text-sm">
//                 <Mail className="h-4 w-4 text-gray-400" />
//                 <span className="text-gray-600">{tracker.email}</span>
//               </div>
//               <div className="flex items-center gap-2 text-sm">
//                 <Phone className="h-4 w-4 text-gray-400" />
//                 <span className="text-gray-600">{tracker.phone}</span>
//               </div>
//               <div className="flex items-center gap-2 text-sm">
//                 <MapPin className="h-4 w-4 text-gray-400" />
//                 <span className="text-gray-600">{tracker.county}</span>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Timeline */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-base">Timeline</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               <div className="flex items-start gap-3">
//                 <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
//                 <div className="text-sm">
//                   <p className="font-medium text-gray-700">Submitted</p>
//                   <p className="text-gray-600">
//                     {format(new Date(tracker.date), 'PPP')}
//                   </p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* Proposal Details */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Proposal Details</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           {tracker.documents && tracker.documents.length > 0 && (
//             <div>
//               <h4 className="text-sm font-medium text-gray-700 mb-3">Documents</h4>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 {tracker.documents.map((doc, index) => (
//                   <Button
//                     key={index}
//                     variant="outline"
//                     className="justify-start h-auto py-3"
//                     onClick={() => window.open(doc.document, '_blank')}
//                   >
//                     <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
//                     <span className="truncate">{doc.original_name}</span>
//                     <ExternalLink className="h-3 w-3 ml-2 flex-shrink-0" />
//                   </Button>
//                 ))}
//               </div>
//             </div>
//           )}

//           <div className="space-y-4">
//             <div className="flex flex-col">
//               <h4 className="text-sm font-medium text-gray-700 mb-2">Intervention Type</h4>
//               <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{tracker.intervention_type || 'Not specified'}</p>
//             </div>
//             <div className="flex flex-col">
//               <h4 className="text-sm font-medium text-gray-700 mb-2">Beneficiary</h4>
//               <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{tracker.beneficiary}</p>
//             </div>
//             <div className="flex flex-col">
//               <h4 className="text-sm font-medium text-gray-700 mb-2">Profession</h4>
//               <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{tracker.profession}</p>
//             </div>
//             <div className="flex flex-col">
//               <h4 className="text-sm font-medium text-gray-700 mb-2">Signature</h4>
//               <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{tracker.signature}</p>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Briefcase,
  Edit,
  Download,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import type { SubmittedProposal } from '@/types/dashboard/submittedProposals';

import { getSubmittedProposals } from '@/app/api/dashboard/submitted-proposals';  


export default function TrackerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const trackerId = params?.id as string;
  
  const [tracker, setTracker] = useState<SubmittedProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (trackerId) {
      fetchTracker();
    }
  }, [trackerId]);

  const fetchTracker = async () => {
    try {
      setLoading(true);
      setError('');
      const proposals = await getSubmittedProposals();
      const data = proposals.results.find((proposal: SubmittedProposal) => String(proposal.id) === trackerId);
      
      if (!data) {
        throw new Error(`No proposal found with ID: ${trackerId}`);
      }
      
    
      setTracker(data);
    } catch (err) {
      setError('Failed to load intervention details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const convertDocumentUrl = (url: string) => {
    if (url.includes('localhost')) {
      return url.replace(/http:\/\/localhost\/media/, 'https://bptap.health.go.ke/media');
    }
    return url;
  };

  if (loading) {
    return (
      <div className="p-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !tracker) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Intervention</h3>
            <p className="text-red-700 mb-4">{error || 'Intervention not found'}</p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {tracker.name}
            </h1>
            <p className="text-sm text-gray-600 font-mono mt-1">
              {tracker.reference_number}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {tracker.beneficiary || 'Undefined beneficiary'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Justification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                {tracker.justification}
              </p>
            </CardContent>
          </Card>

          {tracker.expected_impact && (
            <Card>
              <CardHeader>
                <CardTitle>Expected Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  {tracker.expected_impact}
                </p>
              </CardContent>
            </Card>
          )}

          {tracker.additional_info && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  {tracker.additional_info}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Proposal Details */}
          <Card>
            <CardHeader>
              <CardTitle>Proposal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {tracker.documents && tracker.documents.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Documents</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tracker.documents.map((doc, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="justify-start h-auto py-3"
                        onClick={() => window.open(convertDocumentUrl(doc.document), '_blank')}
                      >
                        <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{doc.original_name}</span>
                        <ExternalLink className="h-3 w-3 ml-2 flex-shrink-0" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex flex-col">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Intervention Type</h4>
                  <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{tracker.intervention_type || 'Not specified'}</p>
                </div>
                <div className="flex flex-col">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Intervention Name</h4>
                  <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{tracker.intervention_name || 'Not specified'}</p>
                </div>
                <div className="flex flex-col">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Beneficiary</h4>
                  <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{tracker.beneficiary}</p>
                </div>
                <div className="flex flex-col">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Signature</h4>
                  <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{tracker.signature}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


        <div className="space-y-6">

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Submitter Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{tracker.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{tracker.organization}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{tracker.profession}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{tracker.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{tracker.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{tracker.county}</span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-gray-700">Submitted</p>
                  <p className="text-gray-600">
                    {formatDate(tracker.date)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}