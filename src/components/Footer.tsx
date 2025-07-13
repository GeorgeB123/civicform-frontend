import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="hidden bg-[#00154b] text-white py-8 px-4 lg:block">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end">
          {/* Footer content area - you can add your content here */}
          <div className="flex-1 mb-4 md:mb-0">
            {/* Add your footer content here */}
            <div className="space-y-4">
              <p className="text-sm">
                © {new Date().getFullYear()} Bonnici. All rights
                reserved.
              </p>
            </div>
          </div>

          {/* Logo in bottom right */}
          <div className="flex-shrink-0">
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
