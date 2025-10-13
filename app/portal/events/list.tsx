import React from 'react';
import { 
  Calendar, 
  MapPin, 
  ExternalLink, 
  Clock,
  Eye,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Event } from '@/types/dashboard/event';
import { format } from 'date-fns';

interface EventListProps {
  events: Event[];
  onView: (event: Event) => void;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
  loading?: boolean;
  hideActions?: boolean;
}

const EventList: React.FC<EventListProps> = ({
  events,
  onView,
  onEdit,
  onDelete,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading events...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No events found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div
          key={event.id}
          className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {event.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mt-2">
                    {event.event_type && (
                      <Badge variant="outline" className="text-xs">
                        {event.event_type}
                      </Badge>
                    )}
                    {event.is_upcoming && (
                      <Badge className="text-xs bg-green-100 text-green-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Upcoming
                      </Badge>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(event)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(event)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(event.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {event.description && (
                <p className="mt-3 text-gray-600 line-clamp-2">{event.description}</p>
              )}

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>
                    {format(new Date(event.start_date), "PPP 'at' p")}
                    {event.end_date && ` - ${format(new Date(event.end_date), "p")}`}
                  </span>
                </div>

                {event.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{event.location}</span>
                  </div>
                )}

                {event.link && (
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Join meeting</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventList;