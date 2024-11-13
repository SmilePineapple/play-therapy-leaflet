"use client";

import Image from "next/image";
import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Clock, Calendar, Shield, Smile, UserCircle2, PlaySquare, 
  Heart, Star, Sun, Cloud, Moon, Palette, Music2, 
  Gamepad, Building2, Printer, Edit2, ImageIcon, Upload,
  Plus, X, Trash
} from 'lucide-react';

const EditableField = ({ value, onChange, className }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  if (isEditing) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setIsEditing(false)}
        className={`border-b-2 border-blue-300 bg-transparent focus:outline-none text-center ${className}`}
        autoFocus
      />
    );
  }
  
  return (
    <div 
      onClick={() => setIsEditing(true)}
      className="cursor-pointer group relative inline-block"
    >
      <span className={className}>{value}</span>
      <Edit2 className="w-4 h-4 text-blue-400 absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 print:hidden" />
    </div>
  );
};

const EditableImage = ({ src, alt, className, onImageChange, onDelete }) => {
  const fileInputRef = useRef(null);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

const handlePrint = () => {
  window.print();
};

  const handleClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="relative group">
      <Image
  src={src.startsWith('data:') ? src : `/api/placeholder/${src}`}
  alt={alt}
  className={className}
  width={400} // Replace with actual width
  height={200} // Replace with actual height
/>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
        <div className="cursor-pointer" onClick={handleClick}>
          <Upload className="w-8 h-8 text-white mb-2" />
          <span className="text-white text-sm">Click to upload image</span>
        </div>
        {onDelete && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-2 right-2 p-1 bg-red-500 rounded-full"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

const PlayTherapyLeaflet = () => {
  const [childName, setChildName] = useState("Your Name");
  const [therapistName, setTherapistName] = useState("Jayne");
  const [sessionDay, setSessionDay] = useState("Wednesday");
  const [sessionTime, setSessionTime] = useState("11:30am - 12:15pm");
  const [numWeeks, setNumWeeks] = useState("12");
  const [welcomeText, setWelcomeText] = useState("Welcome to The Play Room");
  const [notes, setNotes] = useState("During our play session together, I will be hoping to learn all I can about you. All you need to do is play. I want to help and support the important adults in your life. I really look forward to meeting you 'clients name'. See you on 'day of week'.");
  
  const [lodgeImage, setLodgeImage] = useState("400/200");
  const [therapistImage, setTherapistImage] = useState("150/150");
  const [playImages, setPlayImages] = useState([{ id: 1, src: "400/250" }]);

  const addPlayImage = () => {
    const newId = Math.max(...playImages.map(img => img.id), 0) + 1;
    setPlayImages([...playImages, { id: newId, src: "400/250" }]);
  };

  const updatePlayImage = (id, newSrc) => {
    setPlayImages(playImages.map(img => 
      img.id === id ? { ...img, src: newSrc } : img
    ));
  };

  const deletePlayImage = (id) => {
    if (playImages.length > 1) {
      setPlayImages(playImages.filter(img => img.id !== id));
    }
  };

  const deleteSection = (sectionId) => {
    // Implement section deletion logic here
  };

  return (
    <div>
      {/* Print Button */}
      <button
  onClick={() => {
    if (typeof window !== "undefined") {
      handlePrint();
    }
  }}
  className="fixed top-4 right-4 flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 print:hidden"
>
  <Printer className="w-5 h-5" />
  <span>Print Leaflet</span>
</button>

      <div className="max-w-4xl mx-auto p-6 space-y-8 bg-gradient-to-b from-white to-blue-50 print:bg-white print:m-0 print:p-0 print:max-w-none">
        {/* Decorative Header */}
        <div className="flex justify-around mb-8 print:hidden">
          <Sun className="w-8 h-8 text-yellow-400 animate-pulse" />
          <Cloud className="w-8 h-8 text-blue-300" />
          <Star className="w-8 h-8 text-yellow-400 animate-pulse" />
          <Moon className="w-8 h-8 text-blue-300" />
          <Star className="w-8 h-8 text-yellow-400 animate-pulse" />
        </div>

        {/* Welcome Section */}
        <Card className="bg-sky-50 border-t-4 border-sky-400 shadow-lg print:shadow-none relative">
          <button
            onClick={() => deleteSection('welcome')}
            className="absolute top-2 right-2 p-1 bg-red-500 rounded-full print:hidden"
          >
            <Trash className="w-4 h-4 text-white" />
          </button>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <EditableImage 
                src={lodgeImage}
                alt="The Lodge Building"
                className="mx-auto rounded-lg shadow-md print:shadow-none w-full max-w-lg h-48 object-cover"
                onImageChange={setLodgeImage}
              />
              <div className="flex justify-center space-x-4">
                <Star className="w-12 h-12 text-green-600" />
                <Building2 className="w-16 h-16 text-sky-600" />
                <Star className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-sky-800">
                <EditableField
                  value={welcomeText}
                  onChange={setWelcomeText}
                  className="text-3xl font-bold text-sky-800"
                />
              </h1>
              <h2 className="text-2xl text-sky-700">
                <EditableField
                  value={childName}
                  onChange={setChildName}
                  className="text-2xl text-sky-700 font-bold"
                />
              </h2>
            </div>
          </CardContent>
        </Card>

        {/* Meeting Therapist Section */}
        <Card className="bg-purple-50 border-t-4 border-purple-400 shadow-lg print:shadow-none relative">
          <button
            onClick={() => deleteSection('therapist')}
            className="absolute top-2 right-2 p-1 bg-red-500 rounded-full print:hidden"
          >
            <Trash className="w-4 h-4 text-white" />
          </button>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <EditableImage 
                src={therapistImage}
                alt="Your Play Therapist"
                className="mx-auto rounded-full shadow-md print:shadow-none w-32 h-32 object-cover"
                onImageChange={setTherapistImage}
              />
              <h2 className="text-2xl font-bold text-purple-800">
                Hi, I am <EditableField
                  value={therapistName}
                  onChange={setTherapistName}
                  className="text-2xl font-bold text-purple-800"
                />
              </h2>
              <p className="text-xl text-purple-700">
                <EditableField value={childName} onChange={setChildName} className="text-lg text-purple-700" /> is safe, <EditableField value={therapistName} onChange={setTherapistName} className="text-lg text-purple-700" /> is safe, and everything in the play room is safe. <EditableField value={childName} onChange={setChildName} className="text-lg text-purple-700" /> is the boss of play and <EditableField value={therapistName} onChange={setTherapistName} className="text-lg text-purple-700" /> is the boss of safety.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Play Section */}
        <Card className="bg-green-50 border-t-4 border-green-400 shadow-lg print:shadow-none relative">
          <button
            onClick={() => deleteSection('play')}
            className="absolute top-2 right-2 p-1 bg-red-500 rounded-full print:hidden"
          >
            <Trash className="w-4 h-4 text-white" />
          </button>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {playImages.map((image) => (
                  <EditableImage 
                    key={image.id}
                    src={image.src}
                    alt="Play Area"
                    className="mx-auto rounded-lg shadow-md print:shadow-none w-full h-48 object-cover"
                    onImageChange={(newSrc) => updatePlayImage(image.id, newSrc)}
                    onDelete={() => deletePlayImage(image.id)}
                  />
                ))}
                <button 
                  onClick={addPlayImage}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-green-300 rounded-lg hover:bg-green-100 transition-colors print:hidden"
                >
                  <Plus className="w-8 h-8 text-green-500" />
                </button>
              </div>
              <h2 className="text-2xl font-bold text-green-800">Time to Play!</h2>
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-6 h-6 text-green-600" />
                <EditableField
                  value={sessionTime}
                  onChange={setSessionTime}
                  className="text-lg text-green-700"
                />
              </div>
              <p className="text-xl text-green-700">Lots of different toys to play with</p>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="text-center">
                  <Palette className="w-8 h-8 mx-auto text-green-500" />
                  <p className="text-sm text-green-600">Art & Crafts</p>
                </div>
                <div className="text-center">
                  <Gamepad className="w-8 h-8 mx-auto text-green-500" />
                  <p className="text-sm text-green-600">Games</p>
                </div>
                <div className="text-center">
                  <Music2 className="w-8 h-8 mx-auto text-green-500" />
                  <p className="text-sm text-green-600">Music</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Section */}
        <Card className="bg-amber-50 border-t-4 border-amber-400 shadow-lg print:shadow-none relative">
          <button
            onClick={() => deleteSection('calendar')}
            className="absolute top-2 right-2 p-1 bg-red-500 rounded-full print:hidden"
          >
            <Trash className="w-4 h-4 text-white" />
          </button>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Calendar className="w-12 h-12 mx-auto text-amber-600" />
              <h3 className="text-xl font-bold text-amber-800">
                For <EditableField
                  value={numWeeks}
                  onChange={setNumWeeks}
                  className="text-xl font-bold text-amber-800"
                /> weeks
              </h3>
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-8 h-8 text-amber-600" />
                <p className="text-lg text-amber-700">Every {sessionDay}</p>
              </div>
              <div className="flex justify-center">
                <div className="grid grid-cols-6 gap-1">
                  {[...Array(parseInt(numWeeks))].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* General Notes Section */}
        <Card className="bg-gray-50 border-t-4 border-gray-400 shadow-lg print:shadow-none relative">
          <button
            onClick={() => deleteSection('notes')}
            className="absolute top-2 right-2 p-1 bg-red-500 rounded-full print:hidden"
          >
            <Trash className="w-4 h-4 text-white" />
          </button>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Smile className="w-12 h-12 mx-auto text-gray-500" />
              <EditableField
                value={notes}
                onChange={setNotes}
                className="text-lg text-gray-700"
              />
            </div>
          </CardContent>
        </Card>

        {/* Print-specific styles */}
        <style>{`
          @media print {
            @page { 
              size: A4; 
              margin: 0.5cm;
            }
            .print\:m-0 { 
              margin: 0; 
            }
            .print\:p-0 { 
              padding: 0; 
            }
            .print\:max-w-none { 
              max-width: none; 
            }
            .print\:hidden { 
              display: none; 
            }
            .print\:break-before-avoid { 
              break-before: avoid; 
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default PlayTherapyLeaflet;