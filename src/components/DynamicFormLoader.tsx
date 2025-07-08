"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClientWebformService } from "@/services/clientWebformService";

export default function DynamicFormLoader() {
  const [webformId, setWebformId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!webformId.trim()) {
      setError("Please enter a webform ID");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const webformService = new ClientWebformService();
      await webformService.fetchFormStructure(webformId.trim());
      
      router.push(`/form/${webformId.trim()}`);
    } catch (err) {
      console.error("Error validating webform:", err);
      setError(
        err instanceof Error 
          ? `Webform not found: ${err.message}` 
          : "Failed to load webform. Please check the ID and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          value={webformId}
          onChange={(e) => setWebformId(e.target.value)}
          placeholder="Enter webform ID (e.g., stolen_property)"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          disabled={isLoading}
        />
      </div>
      
      {error && (
        <div className="text-red-600 text-sm text-left">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? "Validating..." : "Load Form"}
      </button>
    </form>
  );
}