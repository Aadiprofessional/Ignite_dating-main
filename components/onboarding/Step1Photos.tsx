'use client';

import React, { useState } from 'react';
import { useOnboarding, Photo } from '@/context/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Camera, X, GripVertical } from 'lucide-react';
import { useStore } from '@/lib/store';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortablePhotoProps {
  photo: Photo;
  index: number;
  onRemove: (id: string) => void;
}

const SortablePhoto = ({ photo, index, onRemove }: SortablePhotoProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group aspect-[3/4] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 ${
        index === 0 ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'
      }`}
    >
      <img src={photo.url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
      
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="p-2 bg-black/50 rounded-full text-white hover:bg-crimson transition-colors cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={16} />
        </button>
        <button
          onClick={() => onRemove(photo.id)}
          className="p-2 bg-black/50 rounded-full text-white hover:bg-crimson transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {index === 0 && (
        <div className="absolute bottom-2 left-2 bg-crimson px-2 py-1 rounded text-xs font-dm-mono text-white">
          Main Photo
        </div>
      )}
    </div>
  );
};

const EmptySlot = ({
  index,
  onAdd,
  disabled,
}: {
  index: number;
  onAdd: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}) => {
  return (
    <label
      className={`relative flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-zinc-800 hover:border-crimson rounded-xl transition-colors bg-zinc-900/30 hover:bg-zinc-900/50 ${
        index === 0 ? 'col-span-2 row-span-2 aspect-[3/4]' : 'col-span-1 row-span-1 aspect-[3/4]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onAdd}
        disabled={disabled}
      />
      <div className="p-3 rounded-full bg-zinc-800 text-zinc-400 mb-2">
        <Camera size={24} />
      </div>
      <span className="text-xs text-zinc-500 font-dm-mono">{disabled ? 'Uploading...' : 'Add Photo'}</span>
    </label>
  );
};

export default function Step1Photos() {
  const { uploadProfilePhoto } = useStore();
  const { data, updateData, nextStep } = useOnboarding();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddPhoto = (url: string) => {
    if (data.photos.length < 6) {
      const newPhoto: Photo = {
        id: Math.random().toString(36).substr(2, 9),
        url,
      };
      updateData({ photos: [...data.photos, newPhoto] });
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoUploadError(null);
    setIsUploadingPhoto(true);
    try {
      const url = await uploadProfilePhoto(file);
      handleAddPhoto(url);
    } catch (error) {
      setPhotoUploadError(error instanceof Error ? error.message : 'Failed to upload photo.');
    } finally {
      setIsUploadingPhoto(false);
      event.target.value = '';
    }
  };

  const handleRemovePhoto = (id: string) => {
    updateData({ photos: data.photos.filter((p) => p.id !== id) });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = data.photos.findIndex((p) => p.id === active.id);
      const newIndex = data.photos.findIndex((p) => p.id === over.id);
      updateData({ photos: arrayMove(data.photos, oldIndex, newIndex) });
    }
  };

  const slots = Array.from({ length: 6 });

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-4xl font-serif font-bold text-offwhite mb-2">Add Your Photos</h2>
        <p className="text-zinc-400 font-mono text-sm">Add at least 1 photo to continue.</p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={data.photos.map((p) => p.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {slots.map((_, index) => {
              const photo = data.photos[index];
              if (photo) {
                return (
                  <SortablePhoto
                    key={photo.id}
                    photo={photo}
                    index={index}
                    onRemove={handleRemovePhoto}
                  />
                );
              } else {
                return (
                  <EmptySlot
                    key={`empty-${index}`}
                    index={index}
                    onAdd={(event) => void handleFileSelect(event)}
                    disabled={isUploadingPhoto}
                  />
                );
              }
            })}
          </div>
        </SortableContext>
      </DndContext>
      {photoUploadError ? <p className="text-sm text-crimson mb-4">{photoUploadError}</p> : null}

      <div className="mt-auto flex justify-end">
        <Button
          onClick={nextStep}
          disabled={data.photos.length < 1 || isUploadingPhoto}
          className="bg-crimson hover:bg-crimson/90 text-white font-dm-mono px-8"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}
