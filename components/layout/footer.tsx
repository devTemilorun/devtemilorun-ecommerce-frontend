import Link from 'next/link'
import { Mail } from 'lucide-react'
 
export function Footer() {
  return (
    <footer className="border-t bg-muted/50 mt-auto">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-sm font-semibold">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/shop" className="hover:text-primary transition-colors">All Products</Link></li>
              <li><Link href="/shop?is_featured=true" className="hover:text-primary transition-colors">Featured Products</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="" className="hover:text-primary transition-colors">Shipping Info</Link></li>
              <li><Link href="" className="hover:text-primary transition-colors">Returns Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="" className="hover:text-primary transition-colors">Press</Link></li>
              <li><Link href="" className="hover:text-primary transition-colors">Blog</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
              <li><Link href="" className="hover:text-primary transition-colors">Accessibility</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ModernStore. All rights reserved.</p>
        </div>
        {/* Bottom Bar - Your Design */}
        <div className="border-t pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center text-sm text-muted-foreground">
            <p>
              Designed & Developed by <span className="font-semibold text-primary">devTemilorun</span> 
              {' '}© {new Date().getFullYear()}
            </p>
            
            <div className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-muted-foreground/50 hidden sm:block" />
              <a 
                href="mailto:contact@olawuniisrael2020@gmail.com" 
                className="flex items-center gap-2 hover:text-primary transition-colors group"
              >
                <span>Drop a message</span>
                <Mail className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}