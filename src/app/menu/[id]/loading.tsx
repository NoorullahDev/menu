export default function Loading() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* HEADER SKELETON */}
      <header className="w-full bg-gray-200 py-10 md:py-16 px-4 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="h-10 md:h-14 bg-gray-300 w-3/4 md:w-1/2 rounded-xl mb-4 animate-pulse"></div>
        <div className="h-6 bg-gray-300 w-48 rounded-lg animate-pulse"></div>
      </header>

      {/* MENU CONTENT SKELETON */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {[1, 2, 3].map((catIndex) => (
          <div key={catIndex} className="my-8 first:mt-2">
            {/* Category Header Skeleton */}
            <div className="h-8 bg-gray-200 w-40 rounded-lg mb-4 animate-pulse"></div>
            
            {/* Category Items Skeleton */}
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map((itemIndex) => (
                <div 
                  key={itemIndex} 
                  className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 flex justify-between items-start animate-pulse"
                >
                  <div className="pr-4 flex-1">
                    <div className="h-6 bg-gray-200 w-3/4 rounded-lg mb-3"></div>
                    <div className="h-4 bg-gray-100 w-1/2 rounded-lg"></div>
                  </div>
                  <div className="shrink-0 mt-0.5">
                    <div className="h-6 bg-gray-200 w-16 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
            
            {catIndex < 3 && (
              <div className="w-full h-px bg-gray-100 mt-8"></div>
            )}
          </div>
        ))}
      </main>

      {/* FOOTER SKELETON */}
      <footer className="bg-[#F5F5F4] py-8 flex flex-col items-center px-4 mt-4 border-t border-gray-200">
        <div className="h-5 bg-gray-300 w-32 rounded-lg mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 w-48 rounded-lg animate-pulse"></div>
      </footer>
    </div>
  );
}
