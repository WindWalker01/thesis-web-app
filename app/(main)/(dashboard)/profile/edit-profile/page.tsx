"use client";

import Link from "next/link";
import NavBar from "@/components/blocks/navbar";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Save, X, CheckCircle, User, Mail,
  Link as LinkIcon, Twitter, Instagram, Globe,
  ArrowLeft,
} from "lucide-react";

/* ── Form field component ── */
function Field({
  label, id, type = "text", placeholder, value, onChange, icon: Icon,
}: {
  label: string; id: string; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void; icon: React.ElementType;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-slate-500">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>
    </div>
  );
}

export default function EditProfilePage() {
  const [name,       setName]       = useState("Nathaniel Pogi 123.");
  const [bio,        setBio]        = useState("Digital artist specializing in concept art, sci-fi illustrations, and perceptual design. Protecting my creations with ArtForgeLab.");
  const [email,      setEmail]      = useState("nathanielpogisarap@artforgelab.ph");
  const [twitter,    setTwitter]    = useState("@handsomeboy_tanyel");
  const [instagram,  setInstagram]  = useState("@viva_sto-nino");
  const [saved,      setSaved]      = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    // Simulate save — replace with API call
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  return (
    <main className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <NavBar />
      <div className="h-1 w-full bg-linear-to-r from-blue-600 via-blue-400 to-orange-400" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-16">

        {/* Back link */}
        <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-500 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-black mb-1">Edit Profile</h1>
          <p className="text-sm text-slate-400 mb-8">Update your artist information and public profile.</p>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 space-y-8">

            {/* ── Avatar upload ── */}
            <div className="flex items-center gap-6">
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-linear-to-br from-blue-500 to-orange-500 flex items-center justify-center text-white text-3xl font-black">
                  {avatarPreview
                    ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                    : "NP"
                  }
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white shadow-md transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <div>
                <p className="text-sm font-bold">Profile Picture</p>
                <p className="text-xs text-slate-400 mt-1">JPG, PNG or WebP · Max 5MB</p>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="mt-2 text-xs text-blue-500 hover:text-blue-400 transition-colors font-semibold"
                >
                  Change Photo
                </button>
              </div>
            </div>

            {/* ── Basic info ── */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                Basic Information
              </h3>
              <Field label="Artist Name"   id="name"      placeholder="Your name"          value={name}      onChange={setName}      icon={User}     />
              <Field label="Email Address" id="email"     type="email" placeholder="your@email.com" value={email} onChange={setEmail} icon={Mail}     />

              <div className="space-y-1.5">
                <label htmlFor="bio" className="text-xs font-bold uppercase tracking-widest text-slate-500">Bio</label>
                <textarea
                  id="bio"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the world about your art..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                />
                <p className="text-[10px] text-slate-400 text-right">{bio.length}/250</p>
              </div>
            </div>

            {/* ── Links ── */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                Links &amp; Social
              </h3>
              <Field label="Twitter"       id="twitter"    placeholder="@yourhandle"               value={twitter}    onChange={setTwitter}    icon={Twitter}  />
              <Field label="Instagram"     id="instagram"  placeholder="@yourhandle"               value={instagram}  onChange={setInstagram}  icon={Instagram}/>
            </div>

            {/* ── Buttons ── */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
              <Link href="/profile" className="flex-1">
                <button className="w-full flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 py-3 rounded-xl text-sm font-semibold transition-colors">
                  <X className="w-4 h-4" /> Cancel
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Success toast ── */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-2xl shadow-2xl border border-white/10"
          >
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm font-bold">Profile Updated!</p>
              <p className="text-xs opacity-70">Your changes have been saved successfully.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}