"use client";

import { useState } from "react";
import { CalendarDays, MapPin, Clock, Users, Video, Globe, Plus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils/cn";
import { toggleRsvpAction, createEventAction } from "@/lib/actions/events";

interface EventsClientProps {
  initialEvents: any[];
  userRsvpIds: string[];
}

export default function EventsClient({ initialEvents, userRsvpIds }: EventsClientProps) {
  const [events, setEvents] = useState<any[]>(initialEvents);
  const [rsvpIds, setRsvpIds] = useState<string[]>(userRsvpIds);
  const [filter, setFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Create event form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("virtual");
  const [category, setCategory] = useState("networking");
  const [location, setLocation] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [loading, setLoading] = useState(false);
  const [rsvpPending, setRsvpPending] = useState<string | null>(null);

  async function handleRsvp(eventId: string) {
    setRsvpPending(eventId);
    try {
      const res = await toggleRsvpAction(eventId);
      if (res.success) {
        if (rsvpIds.includes(eventId)) {
          setRsvpIds((prev) => prev.filter((id) => id !== eventId));
          setEvents((prev) => 
            prev.map((e) => e.id === eventId ? { ...e, attendees_count: Math.max(0, e.attendees_count - 1) } : e)
          );
          toast.success("Cancelled RSVP successfully");
        } else {
          setRsvpIds((prev) => [...prev, eventId]);
          setEvents((prev) => 
            prev.map((e) => e.id === eventId ? { ...e, attendees_count: e.attendees_count + 1 } : e)
          );
          toast.success("RSVP'd successfully!");
        }
      } else {
        toast.error(res.error || "Failed to RSVP.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setRsvpPending(null);
    }
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !startDate) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("event_type", eventType);
      formData.append("category", category);
      formData.append("location", location || (eventType === "virtual" ? "Online" : "TBD"));
      formData.append("meeting_url", meetingUrl);
      formData.append("start_date", startDate);
      formData.append("max_attendees", maxAttendees);

      const res = await createEventAction(formData);
      if (res.success) {
        toast.success("Event created successfully!");
        // Reset form and reload
        setTitle("");
        setDescription("");
        setLocation("");
        setMeetingUrl("");
        setStartDate("");
        setMaxAttendees("");
        setShowCreateForm(false);
        window.location.reload();
      } else {
        toast.error(res.error || "Failed to create event");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  const filteredEvents = events.filter((e) => {
    if (filter === "all") return true;
    return e.event_type.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink font-sans">Events</h1>
          <p className="mt-1 text-sm text-muted">Pitch nights, meetups, office hours, and masterclasses</p>
        </div>
        <Button size="sm" onClick={() => setShowCreateForm(!showCreateForm)} className="gap-2">
          <Plus size={15} />
          Create event
        </Button>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <Card className="border border-primary/20 bg-surface/50 overflow-hidden animate-in slide-in-from-top duration-300">
          <CardContent className="p-6">
            <h2 className="font-bold text-ink mb-4">Launch New Event</h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase">Event Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pitch Night & Mixer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-border bg-white px-3 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase">Date and Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-border bg-white px-3 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted uppercase">Description</label>
                <textarea
                  placeholder="Explain what the event is about, guest speakers, agendas, etc..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full rounded-xl border border-border bg-white p-3 text-xs focus:border-primary focus:outline-none resize-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase">Format</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-border bg-white px-3 text-xs focus:border-primary focus:ring-primary"
                  >
                    <option value="virtual">Virtual (Online)</option>
                    <option value="in-person">In-Person</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-border bg-white px-3 text-xs focus:border-primary focus:ring-primary"
                  >
                    <option value="networking">Networking Mixer</option>
                    <option value="pitch-night">Pitch Night</option>
                    <option value="office-hours">Office Hours</option>
                    <option value="masterclass">Masterclass</option>
                    <option value="hackathon">Hackathon</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase">Location / Meeting URL</label>
                  <input
                    type="text"
                    placeholder={eventType === "virtual" ? "e.g. Zoom link" : "e.g. 100 Pine St, SF"}
                    value={eventType === "virtual" ? meetingUrl : location}
                    onChange={(e) => eventType === "virtual" ? setMeetingUrl(e.target.value) : setLocation(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-border bg-white px-3 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase">Max Attendees (Optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 100"
                    value={maxAttendees}
                    onChange={(e) => setMaxAttendees(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-border bg-white px-3 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={loading}>
                  {loading ? "Publishing..." : "Publish Event"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Type filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "all", label: "All Events" },
          { id: "virtual", label: "Virtual (Online)" },
          { id: "in-person", label: "In-Person" },
          { id: "hybrid", label: "Hybrid" }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={cn(
              "rounded-xl border px-3.5 py-1.5 text-xs font-bold transition",
              filter === t.id
                ? "border-ink bg-ink text-white"
                : "border-border bg-surface text-muted hover:border-ink hover:text-ink"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Events grid */}
      {filteredEvents.length === 0 ? (
        <div className="rounded-3xl border border-border bg-surface py-20 text-center">
          <CalendarDays size={36} className="mx-auto mb-3 text-muted opacity-40 animate-pulse" />
          <p className="font-bold text-muted">No events found</p>
          <p className="mt-1 text-sm text-muted">Create a new meetup or mix filters to view other events.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => {
            const hasRsvpd = rsvpIds.includes(event.id);
            const isFull = event.max_attendees && event.attendees_count >= event.max_attendees;
            
            return (
              <div key={event.id} className="flex flex-col rounded-3xl border border-border bg-white p-6 hover-lift shadow-card justify-between min-h-[320px]">
                <div>
                  {/* Type badge */}
                  <div className="mb-4 flex items-center justify-between">
                    <Badge className={cn("text-[10px] font-bold capitalize",
                      event.event_type === "virtual"
                        ? "bg-blue-50 border-blue-100 text-blue-700"
                        : event.event_type === "hybrid"
                        ? "bg-violet-50 border-violet-100 text-violet-700"
                        : "bg-emerald-50 border-emerald-100 text-emerald-700"
                    )}>
                      {event.event_type === "virtual" ? (
                        <Video size={10} className="mr-1 inline" />
                      ) : (
                        <MapPin size={10} className="mr-1 inline" />
                      )}
                      {event.event_type}
                    </Badge>
                    <Badge className="text-[10px] bg-surface border-border text-muted font-bold capitalize">
                      {event.category}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-ink leading-tight mb-2 text-base">{event.title}</h3>
                  <p className="text-xs text-muted leading-relaxed mb-4 line-clamp-4">{event.description}</p>
                </div>

                <div>
                  {/* Meta */}
                  <div className="space-y-2 border-t border-border/60 pt-4 text-xs font-semibold text-muted">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={13} className="shrink-0" />
                      {new Date(event.start_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={13} className="shrink-0" />
                      {new Date(event.start_date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      {event.event_type === "virtual" ? (
                        <Globe size={13} className="shrink-0" />
                      ) : (
                        <MapPin size={13} className="shrink-0" />
                      )}
                      <span className="truncate">{event.event_type === "virtual" && event.meeting_url ? "Video Link Access" : (event.location || "Online")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={13} className="shrink-0" />
                      {event.attendees_count} attending
                      {event.max_attendees ? ` · ${event.max_attendees - event.attendees_count} spots left` : ""}
                    </div>
                  </div>

                  <Button
                    variant={hasRsvpd ? "secondary" : "primary"}
                    size="sm"
                    disabled={rsvpPending === event.id || (!hasRsvpd && isFull)}
                    onClick={() => handleRsvp(event.id)}
                    className="mt-4 w-full"
                  >
                    {rsvpPending === event.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : hasRsvpd ? (
                      "Attending (Cancel)"
                    ) : isFull ? (
                      "Event Full"
                    ) : (
                      "RSVP"
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
