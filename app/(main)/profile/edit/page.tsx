"use client";

import { useStore } from "@/lib/store";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import Image from "next/image";
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortablePhoto({ id, url, onRemove }: { id: string, url: string, onRemove: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative aspect-[3/4] rounded-xl overflow-hidden group bg-white/5 border border-white/10">
      <Image
        src={url}
        alt="Profile photo"
        fill
        className="object-cover pointer-events-none"
      />
      
      {/* Drag Handle Overlay */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute inset-0 cursor-grab active:cursor-grabbing z-10"
      />

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-crimson rounded-full text-white transition-colors z-20 opacity-100 md:opacity-0 group-hover:opacity-100"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full pointer-events-none z-10">
        DRAG
      </div>
    </div>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const { currentUser, updateProfile, uploadProfilePhoto } = useStore();
  
  const [photos, setPhotos] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [job, setJob] = useState("");
  const [education, setEducation] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (currentUser) {
      setPhotos(currentUser.photos);
      setBio(currentUser.bio);
      setJob(currentUser.job);
      setEducation(currentUser.education || "");
      setInterests(currentUser.interests);
    }
  }, [currentUser]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setPhotos((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleRemovePhoto = (urlToRemove: string) => {
    if (photos.length <= 1) {
      return;
    }
    setPhotos(photos.filter(url => url !== urlToRemove));
  };

  const handleAddInterest = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newInterest.trim()) {
      e.preventDefault();
      if (interests.length >= 10) {
        return;
      }
      if (!interests.includes(newInterest.trim())) {
        setInterests([...interests, newInterest.trim()].slice(0, 10));
      }
      setNewInterest("");
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setInterests(interests.filter(i => i !== interestToRemove));
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !currentUser) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image is too large. Maximum size is 10MB.");
      return;
    }
    if (photos.length >= 9) {
      setUploadError("You can upload up to 9 photos.");
      return;
    }

    setUploadError(null);
    setIsUploadingPhoto(true);
    try {
      const uploadedUrl = await uploadProfilePhoto(file);
      setPhotos((prev) => [...prev, uploadedUrl].slice(0, 9));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Failed to upload photo.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (isUploadingPhoto) return;
    if (!photos.length) {
      setSaveError("At least one profile photo is required.");
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      await updateProfile({
        photos,
        bio,
        job,
        education,
        interests: interests.slice(0, 10)
      });
      router.back();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#080808] pb-32 text-white lg:pb-10">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-white/5 bg-[#080808]/80 px-4 py-4 backdrop-blur-md lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-serif text-xl font-bold">Edit Profile</h1>
        <button 
          onClick={() => void handleSave()}
          disabled={isSaving || isUploadingPhoto}
          className="text-crimson font-bold text-sm hover:text-crimson-dark transition-colors"
        >
          {isSaving ? "Saving..." : isUploadingPhoto ? "Uploading..." : "Done"}
        </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-8 px-4 pt-6 lg:px-8">
        {/* Photos Grid */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Photos</h2>
            <span className="text-xs text-white/40">{photos.length}/9</span>
          </div>
          
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={photos}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-3 gap-3 lg:grid-cols-4">
                {photos.map((url) => (
                  <SortablePhoto 
                    key={url} 
                    id={url} 
                    url={url} 
                    onRemove={() => handleRemovePhoto(url)}
                  />
                ))}
                
                {photos.length < 9 && (
                  <button
                    type="button"
                    disabled={isUploadingPhoto}
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-[3/4] rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors group disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <div className="w-10 h-10 rounded-full bg-crimson flex items-center justify-center group-hover:scale-110 transition-transform">
                      {isUploadingPhoto ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Plus className="w-6 h-6 text-white" />}
                    </div>
                    <span className="text-xs font-bold text-white/60">{isUploadingPhoto ? "Uploading..." : "Add Photo"}</span>
                  </button>
                )}
              </div>
            </SortableContext>
          </DndContext>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => void handleFileSelect(event)} />
          {uploadError ? <p className="text-xs text-crimson mt-2 text-center">{uploadError}</p> : null}
          <p className="text-xs text-white/40 mt-3 text-center">
            Drag and drop to reorder. First photo is your main profile picture.
          </p>
          <p className="text-xs text-white/30 mt-1 text-center">
            At least 1 photo is required.
          </p>
        </div>

        {/* Bio Section */}
        <div className="space-y-2">
          <h2 className="text-lg font-bold">About Me</h2>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write something about yourself..."
            className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-crimson resize-none placeholder:text-white/20"
            maxLength={500}
          />
          <div className="text-right text-xs text-white/30">{bio.length}/500</div>
        </div>

        {/* Details Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Details</h2>
          
          <div className="space-y-1">
            <label className="text-xs text-white/50 ml-1">Job Title</label>
            <input
              type="text"
              value={job}
              onChange={(e) => setJob(e.target.value)}
              placeholder="Add job title"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-crimson"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/50 ml-1">School</label>
            <input
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="Add school"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-crimson"
            />
          </div>
        </div>

        {/* Interests Section */}
        <div className="space-y-2">
          <h2 className="text-lg font-bold">Interests</h2>
          <div className="flex flex-wrap gap-2 mb-2">
            {interests.map((interest) => (
              <div 
                key={interest}
                className="bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-sm flex items-center gap-2"
              >
                <span>{interest}</span>
                <button 
                  onClick={() => removeInterest(interest)}
                  className="hover:text-crimson"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <input
            type="text"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyDown={handleAddInterest}
            placeholder="Add an interest (press Enter)..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-crimson"
          />
          <p className="text-xs text-white/30 ml-1">Maximum 10 interests</p>
        </div>
        {saveError ? <p className="text-sm text-crimson">{saveError}</p> : null}
      </div>
    </div>
  );
}
