"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, Wrench, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from './ui/navigation-menu';

// Placeholder UK flag SVG (can be replaced with a static file if needed)
const UKFlag = () => (
  <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="16" rx="2" fill="#00247D"/>
    <path d="M0 0L24 16M24 0L0 16" stroke="white" strokeWidth="2"/>
    <path d="M0 0L24 16M24 0L0 16" stroke="#CF142B" strokeWidth="1"/>
    <rect x="10" width="4" height="16" fill="white"/>
    <rect y="6" width="24" height="4" fill="white"/>
    <rect x="11" width="2" height="16" fill="#CF142B"/>
    <rect y="7" width="24" height="2" fill="#CF142B"/>
  </svg>
);

export default function Header({ logoSrc = '/logo.svg', onLogoClick }) {
  return (
    <header className="w-full bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo and Brand */}
        <div className="flex items-center gap-4 min-w-[200px]">
          <button onClick={onLogoClick} className="focus:outline-none">
            <Image src={logoSrc} alt="MyApproved Logo" width={160} height={160} className="" />
          </button>
        </div>
        {/* Navigation */}
        <nav className="hidden md:flex space-x-8">
          <Link href="/find-tradespeople" className="text-gray-700 hover:text-blue-700 font-medium transition-colors">Find Tradespeople</Link>
          <Link href="/locations" className="text-gray-700 hover:text-blue-700 font-medium transition-colors">Locations</Link>
          <Link href="/how-it-works" className="text-gray-700 hover:text-blue-700 font-medium transition-colors">How It Works</Link>
          <Link href="/for-tradespeople" className="text-gray-700 hover:text-blue-700 font-medium transition-colors">For Tradespeople</Link>
        </nav>
        {/* Actions: Login, Signup, Admin, Language */}
        <div className="flex items-center space-x-2 min-w-[300px] justify-end">
          {/* Login Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Login</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/login/client" className="flex items-center space-x-2 cursor-pointer">
                  <User className="w-4 h-4" />
                  <span>Client Login</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/login/trade" className="flex items-center space-x-2 cursor-pointer">
                  <Wrench className="w-4 h-4" />
                  <span>Tradesperson Login</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Signup Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black flex items-center space-x-2">
                <span>Sign Up</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/register/client" className="flex items-center space-x-2 cursor-pointer">
                  <User className="w-4 h-4" />
                  <span>Client Registration</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/register/tradesperson" className="flex items-center space-x-2 cursor-pointer">
                  <Wrench className="w-4 h-4" />
                  <span>Tradesperson Registration</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Admin Link */}
          <Button variant="ghost" asChild>
            <Link href="/admin/login" className="text-gray-600 hover:text-gray-900">
              Admin
            </Link>
          </Button>
          {/* Language Button */}
          <div className="relative group ml-2">
  <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-blue-50 border border-gray-200 rounded-md text-sm font-medium text-gray-700 shadow-sm transition-colors">
    <UKFlag />
    <span>English</span>
    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
  </button>
  <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
    <ul className="py-2">
      <li className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"><span className="mr-2"><UKFlag /></span> English (UK)</li>
      <li className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"><span className="mr-2"><svg className="w-5 h-5" viewBox="0 0 32 32"><rect width="32" height="32" fill="#fff"/><rect y="16" width="32" height="16" fill="#dc143c"/></svg></span> Polish</li>
      <li className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"><span className="mr-2"><svg className="w-5 h-5" viewBox="0 0 32 32"><rect width="32" height="32" fill="#002b7f"/><rect x="10.67" width="10.67" height="32" fill="#fcd116"/><rect x="21.33" width="10.67" height="32" fill="#e30a17"/></svg></span> Romanian</li>
      <li className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"><span className="mr-2"><svg className="w-5 h-5" viewBox="0 0 32 32"><rect width="32" height="32" fill="#ff9933"/><rect y="10.67" width="32" height="10.67" fill="#fff"/><rect y="21.33" width="32" height="10.67" fill="#138808"/></svg></span> Punjabi</li>
      <li className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"><span className="mr-2"><svg className="w-5 h-5" viewBox="0 0 32 32"><rect width="32" height="32" fill="#01411c"/><rect y="10.67" width="32" height="10.67" fill="#fff"/><rect y="21.33" width="32" height="10.67" fill="#f7d116"/></svg></span> Urdu</li>
      <li className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"><span className="mr-2"><svg className="w-5 h-5" viewBox="0 0 32 32"><rect width="32" height="32" fill="#006a4e"/><circle cx="16" cy="16" r="8" fill="#f42a41"/></svg></span> Bengali</li>
      <li className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"><span className="mr-2"><svg className="w-5 h-5" viewBox="0 0 32 32"><rect width="32" height="32" fill="#006600"/><rect y="10.67" width="32" height="10.67" fill="#ffcc29"/><rect y="21.33" width="32" height="10.67" fill="#ff0000"/></svg></span> Portuguese</li>
      <li className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"><span className="mr-2"><svg className="w-5 h-5" viewBox="0 0 32 32"><rect width="32" height="32" fill="#fff"/><rect x="10.67" width="10.67" height="32" fill="#007a3d"/><rect x="21.33" width="10.67" height="32" fill="#ce1126"/></svg></span> Arabic</li>
      <li className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"><span className="mr-2"><svg className="w-5 h-5" viewBox="0 0 32 32"><rect width="32" height="32" fill="#4189dd"/><rect y="10.67" width="32" height="10.67" fill="#fff"/><rect y="21.33" width="32" height="10.67" fill="#e94e1b"/></svg></span> Somali</li>
      <li className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"><span className="mr-2"><svg className="w-5 h-5" viewBox="0 0 32 32"><rect width="32" height="32" fill="#ff9933"/><rect y="10.67" width="32" height="10.67" fill="#fff"/><rect y="21.33" width="32" height="10.67" fill="#138808"/></svg></span> Gujarati</li>
      <li className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"><span className="mr-2"><svg className="w-5 h-5" viewBox="0 0 32 32"><rect width="32" height="32" fill="#e30a17"/><rect y="10.67" width="32" height="10.67" fill="#fff"/><rect y="21.33" width="32" height="10.67" fill="#e30a17"/></svg></span> Turkish</li>
      <li className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"><span className="mr-2"><svg className="w-5 h-5" viewBox="0 0 32 32"><rect width="32" height="32" fill="#0055a4"/><rect y="10.67" width="32" height="10.67" fill="#fff"/><rect y="21.33" width="32" height="10.67" fill="#ef4135"/></svg></span> French</li>
      <li className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"><span className="mr-2"><svg className="w-5 h-5" viewBox="0 0 32 32"><rect width="32" height="32" fill="#008c45"/><rect y="10.67" width="32" height="10.67" fill="#fff"/><rect y="21.33" width="32" height="10.67" fill="#cd212a"/></svg></span> Italian</li>
      <li className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"><span className="mr-2"><svg className="w-5 h-5" viewBox="0 0 32 32"><rect width="32" height="32" fill="#c60c30"/><rect y="10.67" width="32" height="10.67" fill="#fff"/><rect y="21.33" width="32" height="10.67" fill="#003478"/></svg></span> Spanish</li>
      <li className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"><span className="mr-2"><svg className="w-5 h-5" viewBox="0 0 32 32"><rect width="32" height="32" fill="#de2910"/><rect x="8" y="8" width="16" height="16" fill="#ffde00"/></svg></span> Chinese (Simplified)</li>
      <li className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"><span className="mr-2"><svg className="w-5 h-5" viewBox="0 0 32 32"><rect width="32" height="32" fill="#003399"/><rect y="10.67" width="32" height="10.67" fill="#fff"/><rect y="21.33" width="32" height="10.67" fill="#ce1126"/></svg></span> Tagalog</li>
      <li className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"><span className="mr-2"><svg className="w-5 h-5" viewBox="0 0 32 32"><rect width="32" height="32" fill="#ffcc00"/><rect y="10.67" width="32" height="10.67" fill="#006a4e"/><rect y="21.33" width="32" height="10.67" fill="#f00"/></svg></span> Lithuanian</li>
      <li className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"><span className="mr-2"><svg className="w-5 h-5" viewBox="0 0 32 32"><rect width="32" height="32" fill="#fff"/><rect y="10.67" width="32" height="10.67" fill="#0039a6"/><rect y="21.33" width="32" height="10.67" fill="#d52b1e"/></svg></span> Russian</li>
      <li className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"><span className="mr-2"><svg className="w-5 h-5" viewBox="0 0 32 32"><rect width="32" height="32" fill="#009b3a"/><polygon points="0,0 32,32 32,0 0,32" fill="#feda00"/><polygon points="8,16 24,16 16,8 16,24" fill="#000"/></svg></span> Jamaican Patois</li>
    </ul>
  </div>
</div>
        </div>
      </div>
    </header>
  );
}
