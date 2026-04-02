import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & About Section */}
          <div className="col-span-1 md:col-span-2">
            {/* Navbar jaisa Logo Design */}
            <Link to="/" className="flex items-center gap-2.5 mb-6 group w-fit">
              {/* Logo Icon / Mark */}
              <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform duration-300">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              
              {/* Logo Text */}
              <div className="flex flex-col justify-center text-left">
                <span className="text-xl font-black tracking-tight text-white leading-none">
                  Instant<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">Shopping</span>
                </span>
                <span className="text-[9px] font-bold text-gray-500 tracking-[0.2em] uppercase mt-0.5">
                  marketplace
                </span>
              </div>
            </Link>

            <p className="text-sm text-gray-400 max-w-xs mb-6 leading-relaxed">
              Your premier destination for quality products. Experience the fastest and most secure online shopping with Instant Shopping.
            </p>
            
            <div className="flex gap-3">
              {[FiFacebook, FiTwitter, FiInstagram].map((Icon, i) => (
                <button key={i} className="w-9 h-9 bg-gray-800/50 border border-gray-700 rounded-lg flex items-center justify-center hover:bg-primary-600 hover:text-white hover:border-primary-500 transition-all duration-300">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-5 tracking-wide text-sm uppercase">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              {[
                ['Home', '/'], 
                ['Products', '/products'], 
                ['Cart', '/cart'], 
                ['My Orders', '/orders'],
                ['Wishlist', '/wishlist']
              ].map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-primary-400 hover:translate-x-1 inline-block transition-all duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-white font-bold mb-5 tracking-wide text-sm uppercase">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <FiMail className="w-5 h-5 text-primary-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Email</p>
                  <span className="hover:text-white transition-colors cursor-pointer">support@instantshopping.com</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <FiPhone className="w-5 h-5 text-primary-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Phone</p>
                  <span className="hover:text-white transition-colors cursor-pointer">+1 (555) 123-4567</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <FiMapPin className="w-5 h-5 text-primary-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Location</p>
                  <span>San Francisco, CA</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 italic">
            © {new Date().getFullYear()} Instant Shopping. All rights reserved.
          </p>
          <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-600">
            <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-400 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}