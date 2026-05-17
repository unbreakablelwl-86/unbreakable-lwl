import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemedLogo } from '@/components/ThemedLogo';
import { ThemeToggle } from '@/components/hub/ThemeToggle';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { AuthModal } from '@/components/tracker/AuthModal';
import { TokenBalanceBadge } from '@/components/ai/TokenBalanceBadge';
import { NavigationDrawer } from '@/components/NavigationDrawer';
import {
  Calculator,
  Dumbbell,
  Flame,
  Timer,
  Footprints,
  UtensilsCrossed,
  BookOpen,
  Calendar,
  Apple,
  Brain,
  GraduationCap,
  UserCheck,
  Shield,
} from 'lucide-react';

const PROGRAMMING_HUB_ITEMS = [
  { title: 'Strength Calculator', href: '/calculators?tab=strength', description: 'Calculate your 1RM and strength level', icon: Dumbbell, group: 'Calculators' },
  { title: 'Fuel Calculator', href: '/calculators?tab=fuel', description: 'Get your calorie and macro targets', icon: Flame, group: 'Calculators' },
  { title: 'Speed Calculator', href: '/calculators?tab=speed', description: 'Analyze your race times and pace', icon: Timer, group: 'Calculators' },
  { title: 'Power: Create', href: '/programming/create', description: 'Build a new programme', icon: Dumbbell, group: 'Power' },
  { title: 'Power: Library', href: '/programming/my-programmes', description: 'View saved programmes', icon: BookOpen, group: 'Power' },
  { title: 'Movement: Create', href: '/tracker/create', description: 'Build a cardio programme', icon: Footprints, group: 'Movement' },
  { title: 'Movement: Library', href: '/tracker/my-programmes', description: 'View saved programmes', icon: BookOpen, group: 'Movement' },
  { title: 'Food Tracker', href: '/fuel', description: 'Log meals and track nutrition', icon: UtensilsCrossed, group: 'Fuel' },
  { title: 'Recipes', href: '/fuel/recipes', description: 'Browse and save recipes', icon: BookOpen, group: 'Fuel' },
  { title: 'Meal Planning', href: '/fuel/planning', description: 'Build weekly meal plans', icon: Calendar, group: 'Fuel' },
  { title: 'Mindset', href: '/mindset', description: 'Mental conditioning', icon: Brain, group: 'Mindset' },
];

interface ListItemProps extends React.ComponentPropsWithoutRef<'a'> {
  title: string;
  icon?: React.ElementType;
  href: string;
}

const ListItem = ({ className, title, children, icon: Icon, href, ...props }: ListItemProps) => (
  <li>
    <NavigationMenuLink asChild>
      <Link
        to={href}
        className={cn(
          'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-primary" />}
          <div className="text-sm font-display tracking-wide leading-none">{title}</div>
        </div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {children}
        </p>
      </Link>
    </NavigationMenuLink>
  </li>
);

const navLinkClass = (active: boolean, highlight?: boolean) =>
  cn(
    'inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-display tracking-wide transition-all border',
    active
      ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_12px_hsl(24_100%_50%/0.35)]'
      : highlight
        ? 'text-primary border-primary/30 hover:bg-primary/10'
        : 'text-muted-foreground border-primary/20 hover:text-primary hover:bg-primary/10 hover:border-primary/40'
  );

export function MainNavigation() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();

  const isCoach = role === 'coach';
  const isDev = role === 'dev';

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href.split('?')[0]);
  };

  const hubActive = ['/calculators', '/programming', '/tracker', '/fuel', '/mindset']
    .some(p => location.pathname.startsWith(p));

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-primary/15">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Theme Toggle + Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <ThemeToggle />
              <Link to="/" className="flex items-center gap-2">
                <ThemedLogo />
                <span className="font-display text-lg tracking-wide text-foreground hidden md:block">
                  UNBREAKABLE
                </span>
              </Link>
            </div>

            {/* Center: Desktop Navigation — well spaced */}
            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList className="gap-1">
                {/* PROGRAMMING HUB mega dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      'font-display tracking-wide text-sm',
                      hubActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-primary'
                    )}
                  >
                    UNBREAKABLE PROGRAMMING
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[500px] gap-2 p-4 md:w-[600px] md:grid-cols-3 lg:w-[700px]">
                      {PROGRAMMING_HUB_ITEMS.map((item) => (
                        <ListItem key={item.title} title={item.title} href={item.href} icon={item.icon}>
                          {item.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* UNBREAKABLE COACHING */}
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/help" className={navLinkClass(isActive('/help'))}>
                      UNBREAKABLE COACHING
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* 121 COACHING */}
                {user && (
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        to={(isCoach || isDev) ? '/coach' : '/my-coaching'}
                        className={navLinkClass(isActive('/coach') || isActive('/my-coaching'), true)}
                      >
                        121 COACHING
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}

                {/* UNIVERSITY */}
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/university" className={navLinkClass(isActive('/university'))}>
                      UNBREAKABLE UNIVERSITY
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

              </NavigationMenuList>
            </NavigationMenu>

            {/* Right: Profile/Dev/Coach cluster + Auth + Mobile Menu */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Desktop-only secondary nav items */}
              <div className="hidden lg:flex items-center gap-1">
                {user && (
                  <Link to="/ai-tokens" className="mr-1">
                    <TokenBalanceBadge showTier />
                  </Link>
                )}
                <Link to="/profile" className={navLinkClass(isActive('/profile'))}>
                  MY PROFILE
                </Link>
                {isDev && (
                  <Link
                    to="/admin"
                    className={cn(
                      'inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-display tracking-wide transition-all border',
                      isActive('/admin')
                        ? 'bg-primary text-primary-foreground shadow-[0_0_12px_hsl(24_100%_50%/0.35)]'
                        : 'text-amber-500 border-amber-500/30 hover:bg-amber-500/10'
                    )}
                  >
                    DEV
                  </Link>
                )}
              </div>
              {!user && (
                <Button
                  size="sm"
                  className="font-display tracking-wide hidden sm:inline-flex"
                  onClick={() => setShowAuthModal(true)}
                >
                  SIGN IN
                </Button>
              )}
              <NavigationDrawer />
            </div>
          </div>
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
