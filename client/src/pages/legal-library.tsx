import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Search, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import BottomNav from "@/components/bottom-nav";

export default function LegalLibrary() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["/api/legal/categories"],
  });

  const { data: articles } = useQuery({
    queryKey: ["/api/legal/articles", { search: searchQuery }],
    queryKey: searchQuery ? ["/api/legal/articles", { search: searchQuery }] : ["/api/legal/articles"],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will automatically refetch with the new search term
  };

  return (
    <div className="mobile-container">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white p-4 border-b border-gray-200 flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <h2 className="text-xl font-semibold text-gray-800">Legal Library</h2>
        </div>

        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Search Bar */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search legal topics..."
                  className="pl-10"
                />
              </form>
            </CardContent>
          </Card>

          {!searchQuery && (
            <>
              {/* Legal Categories */}
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Legal Categories</h3>
                  <div className="space-y-2">
                    {categories?.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <i className={`${category.icon} text-primary`} />
                          <div>
                            <span className="text-gray-800 font-medium">{category.name}</span>
                            <p className="text-sm text-gray-600">{category.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    )) || (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Loading categories...</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Articles */}
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Recent Articles</h3>
                  <div className="space-y-3">
                    {articles?.slice(0, 5).map((article) => (
                      <div key={article.id} className="border-l-4 border-primary pl-4">
                        <h4 className="font-medium text-gray-800">{article.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{article.summary}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(article.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    )) || (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Loading articles...</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Search Results */}
          {searchQuery && (
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Search Results for "{searchQuery}"
                </h3>
                <div className="space-y-3">
                  {articles?.map((article) => (
                    <div key={article.id} className="border-l-4 border-primary pl-4">
                      <h4 className="font-medium text-gray-800">{article.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{article.summary}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  )) || (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Searching...</p>
                    </div>
                  )}
                  
                  {articles?.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No articles found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </main>

        <BottomNav activeTab="legal" />
      </div>
    </div>
  );
}
