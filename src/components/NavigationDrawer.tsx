import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Calculator, Activity, User, LogOut, Settings, Brain, Sparkles, Flame, Dumbbell, Footprints, Apple, Shield, GraduationCap, UserCheck, ChevronDown, Lock, Calendar, Zap } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useUserRole } from '@/hooks/useUserRole';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AuthModal } from '@/components/tracker/AuthModal';
import { TokenBalanceBadge } from '@/components/ai/TokenBalanceBadge';

interface NavigationDrawerProps {
  variant?: 'default' | 'minimal';
}

const freeHubLinks = [
  { to: '/calculators', label: 'CALCULATORS', icon: Calculator, paid: false },
  { to: '/habits', label: 'HABITS', icon: Calendar, paid: false },
];

const paidHubLinks = [
  { to: '/programming', label: 'POWER', icon: Dumbbell, paid: true },
  { to: '/tracker', label: 'MOVEMENT', icon: Footprints, paid: true },
  { to: '/fuel', label: 'FUEL', icon: Apple, paid: true },
  { to: '/mindset', label: 'MINDSET', icon: Brain, paid: true },
];

const hubLinks = [...freeHubLinks, ...paidHubLinks];

export function NavigationDrawer({ variant = 'default' }: NavigationDrawerProps) {
  const [open, setOpen] = useState(false);
  const [hubOpen, setHubOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { isAdminOrOwner, isOwner, role } = useUserRole();
  
  const location = useLocation();

  const isCoach = role === 'coach';
  const isDev = role === 'dev';

  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  const isActive = (path: string) => location.pathname === path;
  const isHubActive = hubLinks.some(l => location.pathname.startsWith(l.to.split('?')[0]));

  const handleNavClick = () => setOpen(false);

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  const linkClass = (path: string, highlight?: boolean, admin?: boolean) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg font-display tracking-wide transition-all border ${
      isActive(path)
        ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_15px_hsl(24_100%_50%/0.4)]'
        : admin
          ? 'text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 border-amber-500/30'
          : highlight
            ? 'text-primary hover:text-primary-foreground hover:bg-primary/80 border-primary/30'
            : 'text-muted-foreground border-primary/20 hover:text-primary hover:bg-primary/10 hover:border-primary/40'
    }`;

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant={variant === 'minimal' ? 'ghost' : 'outline'}
            size="icon"
            className="relative z-50"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 bg-card/95 backdrop-blur-md border-l border-primary/20">
          <SheetHeader className="text-left">
            <SheetTitle className="font-display text-xl tracking-wide text-primary neon-glow-subtle">
              MENU
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col h-full py-6">
            {/* User Section */}
            {user ? (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={profile?.avatar_url || undefined} alt="Profile" />
                    <AvatarFallback className="bg-primary text-primary-foreground font-display text-lg">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-display text-foreground tracking-wide">
                      {profile?.display_name || 'Runner'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {profile?.username ? `@${profile.username}` : user.email}
                    </p>
                  </div>
                </div>
                <Separator className="bg-primary/20" />
              </div>
            ) : (
              <div className="mb-6">
                <Button
                  className="w-full font-display tracking-wide"
                  onClick={() => {
                    setOpen(false);
                    setShowAuthModal(true);
                  }}
                >
                  SIGN IN
                </Button>
                <Separator className="bg-primary/20 mt-6" />
              </div>
            )}

            {/* Navigation Links */}
            <nav className="flex-1 space-y-2 overflow-y-auto">
              {/* HOME */}
              <Link to="/" onClick={handleNavClick} className={linkClass('/')}>
                <Home className={`w-5 h-5 ${isActive('/') ? '' : 'text-primary'}`} />
                TIMELINE
              </Link>

              {/* PROGRAMMING HUB - Collapsible */}
              <Collapsible open={hubOpen || isHubActive} onOpenChange={setHubOpen}>
                <CollapsibleTrigger className={`flex items-center gap-3 px-4 py-3 rounded-lg font-display tracking-wide transition-all w-full text-left ${
                  isHubActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                }`}>
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="flex-1">UNBREAKABLE HOME</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${(hubOpen || isHubActive) ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1 mt-1">
                  {hubLinks.map((link) => {
                    const isLocked = false;
                    return (
                      <Link
                        key={link.to}
                        to={isLocked ? '/plans' : link.to}
                        onClick={handleNavClick}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-display tracking-wide text-sm transition-all ${
                          isActive(link.to)
                            ? 'bg-primary text-primary-foreground'
                            : isLocked
                              ? 'text-muted-foreground/60 hover:text-primary hover:bg-primary/10'
                              : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                        }`}
                      >
                        <link.icon className={`w-4 h-4 ${isActive(link.to) ? '' : 'text-primary'}`} />
                        <span className="flex-1">{link.label}</span>
                        {isLocked && (
                          <Badge variant="outline" className="text-[9px] font-display border-primary/30 text-primary px-1.5 py-0">
                            <Lock className="w-2.5 h-2.5 mr-0.5" />
                            PRO
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>

              {/* UNBREAKABLE COACH — uses Unbreakable token system */}
              <Link to="/help" onClick={handleNavClick} className={linkClass('/help')}>
                <Flame className={`w-5 h-5 ${isActive('/help') ? '' : 'text-primary'}`} />
                <span className="flex-1">UNBREAKABLE COACH</span>
              </Link>

              {/* 121 COACHING */}
              {user && (
                <Link
                  to={(isCoach || isDev) ? '/coach' : '/my-coaching'}
                  onClick={handleNavClick}
                  className={linkClass((isCoach || isDev) ? '/coach' : '/my-coaching', true)}
                >
                  <UserCheck className={`w-5 h-5 ${(isActive('/coach') || isActive('/my-coaching')) ? '' : 'text-primary'}`} />
                  <span className="flex-1">121 COACHING</span>
                  /* subscription lock removed */ {false && (
                    <Badge variant="outline" className="text-[9px] font-display border-primary/30 text-primary px-1.5 py-0">
                      <Lock className="w-2.5 h-2.5 mr-0.5" />
                      PRO
                    </Badge>
                  )}
                </Link>
              )}

              {/* UNIVERSITY — individual course purchases */}
              <Link to="/university" onClick={handleNavClick} className={linkClass('/university')}>
                <GraduationCap className={`w-5 h-5 ${isActive('/university') ? '' : 'text-primary'}`} />
                <span className="flex-1">UNBREAKABLE UNIVERSITY</span>
              </Link>
            </nav>

            {/* Bottom section: Profile, Dev, Coaching, Sign Out */}
            {user && (
              <div className="mt-auto pt-4">
                <Separator className="bg-primary/20 mb-4" />
                <div className="space-y-2">
                  <Link to="/ai-tokens" onClick={handleNavClick} className={linkClass('/ai-tokens')}>
                    <Zap className={`w-5 h-5 ${isActive('/ai-tokens') ? '' : 'text-primary'}`} />
                    <span>UNBREAKABLE TOKENS</span>
                    <TokenBalanceBadge className="ml-auto" />
                  </Link>

                  <Link to="/profile" onClick={handleNavClick} className={linkClass('/profile')}>
                    <User className={`w-5 h-5 ${isActive('/profile') ? '' : 'text-primary'}`} />
                    MY PROFILE
                  </Link>

                  {isDev && (
                    <Link to="/admin" onClick={handleNavClick} className={linkClass('/admin', false, true)}>
                      <Shield className={`w-5 h-5 ${isActive('/admin') ? '' : 'text-amber-500'}`} />
                      DEV
                    </Link>
                  )}


                  <Separator className="bg-primary/20 my-2" />

                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-display tracking-wide text-destructive hover:bg-destructive/10 transition-all w-full text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    SIGN OUT
                  </button>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
