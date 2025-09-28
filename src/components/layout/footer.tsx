import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <span className="text-sm font-bold text-primary-foreground">
                  E
                </span>
              </div>
              <span className="text-xl font-bold text-white">Ethiofy</span>
            </div>
            <p className="text-sm">
              Your premier Print-on-Demand platform for custom Ethiopian designs
              and products. Create, customize, and order unique items with ease.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="transition-colors hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="transition-colors hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="transition-colors hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/products"
                  className="transition-colors hover:text-primary"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/design-studio"
                  className="transition-colors hover:text-primary"
                >
                  Design Studio
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="transition-colors hover:text-primary"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="transition-colors hover:text-primary"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="transition-colors hover:text-primary"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/help"
                  className="transition-colors hover:text-primary"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="transition-colors hover:text-primary"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="transition-colors hover:text-primary"
                >
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link
                  href="/size-guide"
                  className="transition-colors hover:text-primary"
                >
                  Size Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/track-order"
                  className="transition-colors hover:text-primary"
                >
                  Track Your Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>support@ethiofy.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+251 11 123 4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Addis Ababa, Ethiopia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 border-t border-gray-800 pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="text-sm">© 2024 Ethiofy. All rights reserved.</div>
            <div className="flex space-x-6 text-sm">
              <Link
                href="/privacy"
                className="transition-colors hover:text-primary"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="transition-colors hover:text-primary"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="transition-colors hover:text-primary"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
