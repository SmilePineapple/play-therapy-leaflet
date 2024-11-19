"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Clock, Calendar, Smile, Edit2, Upload, Plus, X, Trash
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

  const handleClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="relative group">
      <Image
        src={src.startsWith('data:') ? src : `/api/placeholder/${src}`}
        alt={alt}
        className={className}
        width={400}
        height={200}
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

  const [lodgeImage, setLodgeImage] = useState("400/200");
  const [therapistImage, setTherapistImage] = useState("300/300"); // Updated dimensions
  const [playImages, setPlayImages] = useState([{ id: 1, src: "400/250" }]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div>
      <button
        onClick={handlePrint}
        className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow print:hidden"
      >
        Print Leaflet
      </button>

      <div className="max-w-4xl mx-auto p-6 space-y-8 bg-gradient-to-b from-white to-blue-50 print:bg-white print:max-w-none">
        {/* Page 1 */}
        <div className="print:break-after-page">
          {/* Welcome Section */}
          <Card>
            {/* Content */}
          </Card>

          {/* Therapist Section */}
          <Card>
            {/* Content */}
          </Card>
        </div>

        {/* Page 2 */}
        <div>
          {/* Time to Play Section */}
          <Card>
            {/* Content */}
          </Card>

          {/* Calendar Section */}
          <Card>
            {/* Content */}
          </Card>

          {/* Notes Section */}
          <Card>
            {/* Content */}
          </Card>
        </div>
      </div>

      {/* Print-Specific CSS */}
      <style jsx>{`
        @media print {
          @page {
            size: A4;
            margin: 0.5cm;
          }
          .print\\:hidden {
            display: none;
          }
          .print\\:break-after-page {
            break-after: page;
          }
        }
      `}</style>
    </div>
  );
};

export default PlayTherapyLeaflet;
