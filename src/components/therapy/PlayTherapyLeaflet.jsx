"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock, Calendar, Shield, Smile, UserCircle2, PlaySquare,
  Heart, Star, Sun, Cloud, Moon, Palette, Music2,
  Gamepad, Building2, Printer, Edit2, Upload, Plus, X, Trash
} from "lucide-react";

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

  const handleClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="relative group">
      <Image
        src={src.startsWith("data:") ? src : `/api/placeholder/${src}`}
        alt={alt}
        className={className}
        width={400}
        height={250} // Adjust image height
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
  const [therapistName, setTherapistName] = useState("Pam");
  const [sessionDay, setSessionDay] = useState("Wednesday");
  const [sessionTime, setSessionTime] = useState("11:30am - 12:15pm");
  const [numWeeks, setNumWeeks] = useState("12");
  const [welcomeText, setWelcomeText] = useState("Welcome to The Play Room");

  const [notes, setNotes] = useState(
    `During our play session together, I will be hoping to learn all I can about you. All you need to do is play. I want to help and support the important adults in your life. I really look forward to meeting you ${childName}. See you on ${sessionDay}.`
  );

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div>
      {/* Print Button */}
      <button
        onClick={handlePrint}
        className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg print:hidden"
      >
        <Printer className="w-5 h-5" />
        <span>Print Leaflet</span>
      </button>

      <div className="max-w-4xl mx-auto p-6 space-y-8 bg-gradient-to-b from-white to-blue-50 print:bg-white">
        {/* Page 1 */}
        <div className="print:page-break-after">
          {/* Welcome Section */}
          <Card className="bg-sky-50 border-t-4 border-sky-400 shadow-lg relative">
            <CardContent className="p-6">
              <EditableImage
                src={"400/250"}
                alt="The Play Room"
                className="rounded-lg"
                onImageChange={() => {}}
              />
              <EditableField
                value={welcomeText}
                onChange={setWelcomeText}
                className="text-3xl font-bold text-sky-800"
              />
            </CardContent>
          </Card>

          {/* Therapist Section */}
          <Card className="bg-purple-50 border-t-4 border-purple-400 shadow-lg relative">
            <CardContent className="p-6">
              <EditableImage
                src={"150/150"}
                alt="Therapist"
                className="rounded-full"
                onImageChange={() => {}}
              />
              <EditableField
                value={therapistName}
                onChange={setTherapistName}
                className="text-2xl font-bold text-purple-800"
              />
            </CardContent>
          </Card>
        </div>

        {/* Page 2 */}
        <div>
          {/* Time to Play Section */}
          <Card className="bg-green-50 border-t-4 border-green-400 shadow-lg relative">
            <CardContent className="p-6">
              <h2>Time to Play!</h2>
            </CardContent>
          </Card>

          {/* Calendar Section */}
          <Card className="bg-amber-50 border-t-4 border-amber-400 shadow-lg relative">
            <CardContent className="p-6">
              <h2>Calendar</h2>
            </CardContent>
          </Card>

          {/* General Notes Section */}
          <Card className="bg-gray-50 border-t-4 border-gray-400 shadow-lg relative">
            <CardContent className="p-6">
              <EditableField
                value={notes}
                onChange={setNotes}
                className="text-lg text-gray-700"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 1cm;
          }
          .print\\:page-break-after {
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
};

export default PlayTherapyLeaflet;
