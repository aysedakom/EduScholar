import React, { useState } from 'react';
import {
  User as UserIcon,
  ShieldCheck,
  Palette,
  Lock,
  Bell,
  CheckCircle2,
  Sparkles,
  Camera,
  RefreshCw,
  Sun,
  Moon,
  Smartphone,
  Mail,
  MapPin,
  Building2,
  Phone,
  KeyRound,
  Eye,
  EyeOff,
  ShieldAlert,
  Globe,
  Sliders,
  Award,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme, ACCENT_COLOR_PRESETS } from '../context/ThemeContext';
import type { AccentColor, FontSizeOption } from '../context/ThemeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { toast } from 'sonner';
import { useSearchParams, Link } from 'react-router-dom';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80',
];

export const ProfileManagementPage: React.FC = () => {
  const { user, updateUserProfile, changePassword } = useAuth();
  const {
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    customHex,
    fontSize,
    setFontSize,
    resetPreferences
  } = useTheme();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState<string>(activeTabParam);

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '0917-889-1234');
  const [address, setAddress] = useState(user?.address || '123 Katipunan Ave');
  const [barangay, setBarangay] = useState(user?.barangay || 'Barangay Batasan Hills, Quezon City');
  const [department, setDepartment] = useState(user?.department || (user?.role === 'student' ? 'College of Computer Studies' : 'Quezon City Youth Development Office'));
  const [avatar, setAvatar] = useState(user?.avatar || AVATAR_PRESETS[0]);
  const [bio, setBio] = useState('Passionate Quezon City Scholar pursuing academic excellence and community development.');

  // Password Security State
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [isUpdatingPwd, setIsUpdatingPwd] = useState(false);

  // Custom Color State
  const [customHexInput, setCustomHexInput] = useState(customHex || '#2563eb');

  // Preferences Toggles
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({
      name,
      email,
      phone,
      address,
      barangay,
      department,
      avatar,
    });
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPwd) {
      toast.error('Please enter your current password.');
      return;
    }
    if (newPwd.length < 8) {
      toast.error('New password must be at least 8 characters long.');
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error('New passwords do not match.');
      return;
    }

    setIsUpdatingPwd(true);
    const success = await changePassword(currentPwd, newPwd);
    setIsUpdatingPwd(false);
    if (success) {
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'student': return 'QC Verified Scholar';
      case 'admin': return 'QCYDO Administrator';
      case 'supervisor': return 'Academic Supervisor';
      case 'school_coordinator': return 'Partner School Coordinator';
      case 'treasury': return 'Treasury Officer';
      case 'system_admin': return 'System Administrator';
      default: return 'Authenticated User';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* User Header Profile Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
        {/* Banner Graphic Background */}
        <div className="h-36 sm:h-44 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 relative p-6 flex justify-between items-start">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-black/30 pointer-events-none" />
          <div className="relative z-10 flex items-center gap-2">
            <Badge variant="primary" size="md" className="bg-white/20 text-white backdrop-blur-md border border-white/30 font-bold">
              <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-300" /> Account & Profile Portal
            </Badge>
          </div>
          <div className="relative z-10 hidden sm:block text-right text-white/80 text-xs font-mono font-medium">
            <span>QC GovServe Platform • ID: {user?.id || 'USR-2026'}</span>
          </div>
        </div>

        {/* Profile Card Bottom Details */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-14 sm:-mt-16 z-20">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            <div className="relative group">
              <img
                src={avatar}
                alt={user?.name || 'User Profile Avatar'}
                className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl object-cover border-4 border-white dark:border-slate-900 shadow-xl bg-slate-100 dark:bg-slate-800"
              />
              <button
                type="button"
                onClick={() => handleTabChange('profile')}
                className="absolute bottom-1 right-1 p-2 rounded-xl bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-all cursor-pointer"
                title="Change Avatar"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
                  {name || user?.name || 'PIA MARIE FANER'}
                </h1>
                <Badge variant="success" size="sm" className="font-bold">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                </Badge>
              </div>
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center sm:justify-start gap-1">
                <ShieldCheck className="h-4 w-4" /> {getRoleLabel()}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {email || user?.email || 'student@qc.gov.ph'} • {barangay}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 md:pt-0">
            {user?.role === 'student' && (
              <Link to="/student/profile">
                <Button variant="outline" size="sm" leftIcon={<Award className="h-4 w-4 text-amber-500" />}>
                  View Registry Certificate
                </Button>
              </Link>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleTabChange('appearance')}
              leftIcon={<Palette className="h-4 w-4" />}
            >
              Customize UI Theme
            </Button>
          </div>
        </div>

        {/* Tab Navigation Menu Bar */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 px-4 sm:px-6 flex overflow-x-auto gap-1 sm:gap-2">
          <button
            onClick={() => handleTabChange('profile')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800/60 shadow-xs rounded-t-xl'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserIcon className="h-4 w-4" />
            <span>Personal Profile</span>
          </button>

          <button
            onClick={() => handleTabChange('appearance')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'appearance'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800/60 shadow-xs rounded-t-xl'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Palette className="h-4 w-4 text-purple-500" />
            <span>Customize UI & Colors</span>
            <span className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">New</span>
          </button>

          <button
            onClick={() => handleTabChange('security')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800/60 shadow-xs rounded-t-xl'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock className="h-4 w-4 text-emerald-500" />
            <span>Security & Password</span>
          </button>

          <button
            onClick={() => handleTabChange('notifications')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800/60 shadow-xs rounded-t-xl'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bell className="h-4 w-4 text-amber-500" />
            <span>Notifications</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PERSONAL PROFILE */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <UserIcon className="h-5 w-5 text-blue-600" /> Personal & Account Information
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  Update your contact details, address, and profile photo used across GovServe services.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          placeholder="Your Full Legal Name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          placeholder="name@qc.gov.ph"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Mobile Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          placeholder="09XX-XXX-XXXX"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Institution / Department
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          placeholder="Department name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Street Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          placeholder="House No., Street Name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        QC Barangay Location
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={barangay}
                          onChange={(e) => setBarangay(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          placeholder="Barangay, Quezon City"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Bio / Short Introduction
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      placeholder="Share a short bio or statement..."
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button type="submit" variant="primary" size="md">
                      Save Profile Updates
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Avatar Selector Card */}
          <div className="space-y-6">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Camera className="h-4 w-4 text-blue-600" /> Profile Picture & Swatches
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Select a high-resolution avatar swatch or paste a custom image URL.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center py-2">
                  <img
                    src={avatar}
                    alt="Current Avatar"
                    className="h-24 w-24 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-2">
                    Preset Avatar Swatches
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(preset)}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer ${
                          avatar === preset ? 'border-blue-600 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={preset} alt={`Avatar Preset ${idx + 1}`} className="h-14 w-full object-cover rounded-lg" />
                        {avatar === preset && (
                          <span className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-0.5 shadow-xs">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Custom Image URL
                  </label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick System Standing Card */}
            <Card className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white border-blue-800">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="success" size="sm" className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
                    VERIFIED USER
                  </Badge>
                  <ShieldCheck className="h-5 w-5 text-blue-300" />
                </div>
                <div>
                  <p className="text-[10px] text-blue-200 uppercase font-mono tracking-wider">Account Standing</p>
                  <h4 className="font-heading font-extrabold text-base text-white">Full Access Granted</h4>
                </div>
                <p className="text-xs text-blue-200/80 leading-relaxed">
                  Your identity is cryptographically registered with Quezon City Citizens Charter database.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMIZE UI & THEME COLORS */}
      {activeTab === 'appearance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          <div className="lg:col-span-2 space-y-6">
            {/* Color Swatch Customizer Card */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" /> Theme Color Accents
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  Select your preferred primary color theme. Buttons, active highlights, and indicators will immediately update.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
                    Curated QC Theme Color Swatches
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {ACCENT_COLOR_PRESETS.map((preset) => {
                      const isSelected = accentColor === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setAccentColor(preset.id as AccentColor)}
                          className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer group ${
                            isSelected
                              ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800 shadow-md ring-2 ring-slate-900/10 dark:ring-white/20'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50'
                          }`}
                        >
                          <span
                            className={`h-7 w-7 rounded-xl ${preset.bgClass} shadow-md flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform`}
                          >
                            {isSelected && <Check className="h-4 w-4 stroke-[3]" />}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-slate-900 dark:text-white leading-tight truncate">
                              {preset.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono truncate">
                              {preset.hex}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Hex Color Picker */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Custom Color Picker</h4>
                      <p className="text-[11px] text-slate-500">Pick any custom HEX code for your personal theme accent.</p>
                    </div>
                    {accentColor === 'custom' && (
                      <Badge variant="primary" size="sm">Active Custom</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={customHexInput}
                      onChange={(e) => {
                        setCustomHexInput(e.target.value);
                        setAccentColor('custom', e.target.value);
                      }}
                      className="h-10 w-12 rounded-xl border border-slate-300 dark:border-slate-600 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={customHexInput}
                      onChange={(e) => {
                        setCustomHexInput(e.target.value);
                        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                          setAccentColor('custom', e.target.value);
                        }
                      }}
                      className="w-36 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      placeholder="#2563eb"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAccentColor('custom', customHexInput)}
                    >
                      Apply Hex
                    </Button>
                  </div>
                </div>

                {/* Light vs Dark Mode Selector */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
                    Interface Theme Mode
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                        theme === 'light'
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/30'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <Sun className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black">Light Mode</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Clean, crisp high-contrast layout</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                        theme === 'dark'
                          ? 'border-blue-600 bg-blue-950/50 text-blue-100 ring-2 ring-blue-500/30'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="h-10 w-10 rounded-xl bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0">
                        <Moon className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black">Dark Mode</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Sleek OLED-friendly dark palette</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Font Scaling Options */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
                    Interface Font Scaling
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['sm', 'md', 'lg'] as FontSizeOption[]).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setFontSize(size)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          fontSize === size
                            ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 font-extrabold ring-2 ring-blue-500/30'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-sm uppercase block">{size}</span>
                        <span className="text-[10px] opacity-75 font-normal">
                          {size === 'sm' ? 'Compact (93.75%)' : size === 'md' ? 'Default (100%)' : 'Large (106.25%)'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={resetPreferences} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
                    Reset UI to Default
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => toast.success('UI preferences saved and stored!')}>
                    Save UI Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Live Preview Box */}
          <div className="space-y-6">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 sticky top-20">
              <CardHeader>
                <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-blue-600" /> Real-time Live UI Preview
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  This preview updates dynamically as you toggle colors & modes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sample Card */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="primary" size="sm" className="font-bold">
                      SAMPLE BADGE
                    </Badge>
                    <span className="text-[10px] font-mono text-slate-400">LIVE PREVIEW</span>
                  </div>

                  <div>
                    <h4 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white">
                      Quezon City Youth Grant 2026
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Simulated interface element showing primary accent highlights.
                    </p>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <Button variant="primary" size="sm" className="w-full">
                      Primary Action
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      Secondary
                    </Button>
                  </div>
                </div>

                {/* Sample Input & Active Progress */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Sample Active Focus Input</label>
                  <input
                    type="text"
                    readOnly
                    value="Active focus ring matches theme color"
                    className="w-full rounded-xl border border-blue-500 bg-white dark:bg-slate-900 p-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none ring-2 ring-blue-500/30"
                  />
                </div>

                {/* Progress Bar Preview */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300">Grant Progress</span>
                    <span className="text-blue-600 dark:text-blue-400 font-mono">85%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: '85%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: ACCOUNT & SECURITY */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <KeyRound className="h-5 w-5 text-emerald-600" /> Change Security Password
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  Ensure your account uses a strong password with at least 8 characters.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPwd ? 'text' : 'password'}
                        value={currentPwd}
                        onChange={(e) => setCurrentPwd(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 pl-3 pr-10 text-xs font-mono font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        placeholder="••••••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        New Password
                      </label>
                      <input
                        type={showPwd ? 'text' : 'password'}
                        value={newPwd}
                        onChange={(e) => setNewPwd(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-2.5 text-xs font-mono font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        placeholder="••••••••••••"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type={showPwd ? 'text' : 'password'}
                        value={confirmPwd}
                        onChange={(e) => setConfirmPwd(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-2.5 text-xs font-mono font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        placeholder="••••••••••••"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button type="submit" variant="primary" size="md" isLoading={isUpdatingPwd}>
                      Update Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Active Sessions List */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-blue-600" /> Active Authenticated Sessions
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Devices currently signed into your GovServe profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      PC
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 dark:text-white">Windows Chrome • Current Session</p>
                      <p className="text-[10px] text-slate-400 font-mono">112.198.102.45 • Quezon City, PH</p>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">Active Now</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* 2FA Card */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-emerald-600" /> Two-Factor Authentication (2FA)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Email OTP Verification</p>
                    <p className="text-[10px] text-slate-400">Receive OTP code on login</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTwoFactor(!twoFactor);
                      toast.info(`Two-Factor Email OTP ${!twoFactor ? 'enabled' : 'disabled'}`);
                    }}
                    className={`h-6 w-11 rounded-full p-1 transition-colors cursor-pointer ${
                      twoFactor ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div className={`h-4 w-4 rounded-full bg-white transition-transform ${twoFactor ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 4: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 animate-in fade-in duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
              <Bell className="h-5 w-5 text-amber-500" /> Notification & Dispatch Preferences
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Choose how and when you receive automated scholarship updates from Quezon City Youth Development Office.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Email Notifications</h4>
                <p className="text-[11px] text-slate-500">Receive application stage changes, disbursement notices, and document approvals via email.</p>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotifs(!emailNotifs)}
                className={`h-6 w-11 rounded-full p-1 transition-colors cursor-pointer ${
                  emailNotifs ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div className={`h-4 w-4 rounded-full bg-white transition-transform ${emailNotifs ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">SMS Mobile Alerts</h4>
                <p className="text-[11px] text-slate-500">Receive urgent SMS alerts for payout schedules and appointment verifications.</p>
              </div>
              <button
                type="button"
                onClick={() => setSmsNotifs(!smsNotifs)}
                className={`h-6 w-11 rounded-full p-1 transition-colors cursor-pointer ${
                  smsNotifs ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div className={`h-4 w-4 rounded-full bg-white transition-transform ${smsNotifs ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" size="md" onClick={() => toast.success('Notification preferences saved!')}>
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfileManagementPage;
