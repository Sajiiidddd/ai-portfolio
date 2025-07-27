// app/recommendations/components/RecommendationCard.tsx
import Image from 'next/image';
import { Recommendation } from '../interfaces';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
}

export default function RecommendationCard({ recommendation, onUpvote, onDownvote }: RecommendationCardProps) {
  const { id, type, title, subtitle, imageUrl, year, recommendedBy, review, upvotes, downvotes } = recommendation;

  // Calculate net votes for sorting priority
  const netVotes = upvotes - downvotes;

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-full transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.01] border border-gray-700">
      {/* Image Section */}
      <div className="relative w-full aspect-w-2 aspect-h-3 sm:aspect-w-3 sm:aspect-h-4 flex-shrink-0">
        <Image
          src={imageUrl || '/placeholder-image.png'} // Fallback image
          alt={title}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-image.png'; // Fallback on error
          }}
        />
        {/* Type Badge */}
        <span className={`absolute top-2 right-2 px-3 py-1 text-xs font-semibold rounded-full ${
          type === 'movie' ? 'bg-indigo-600 text-white' : 'bg-green-600 text-white'
        }`}>
          {type === 'movie' ? 'Movie' : 'Song'}
        </span>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-white mb-1 leading-tight line-clamp-2">
          {title} {year && <span className="text-gray-400 text-base">({year})</span>}
        </h3>
        <p className="text-sm text-gray-300 mb-2 line-clamp-1">{subtitle}</p>

        <p className="text-gray-400 text-sm italic mb-3 flex-grow line-clamp-3">
          "{review}"
        </p>

        <p className="text-gray-500 text-xs mt-auto">Recommended by: <span className="font-semibold text-gray-400">{recommendedBy || 'Anonymous'}</span></p>

        {/* Voting Section */}
        <div className="flex items-center justify-between mt-4 border-t border-gray-700 pt-3">
          <div className="flex space-x-2">
            <button
              onClick={() => onUpvote(id)}
              className="flex items-center px-3 py-1 rounded-full bg-gray-700 text-gray-300 hover:bg-green-500 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              aria-label="Upvote"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414L7.586 9H4.5a.5.5 0 000 1h3.086l-2.293 2.293a1 1 0 001.414 1.414L10 10.414l2.293 2.293a1 1 0 001.414-1.414L10.414 9H13.5a.5.5 0 000-1h-3.086z" clipRule="evenodd" />
              </svg>
              {upvotes}
            </button>
            <button
              onClick={() => onDownvote(id)}
              className="flex items-center px-3 py-1 rounded-full bg-gray-700 text-gray-300 hover:bg-red-500 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
              aria-label="Downvote"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm-.707 10.293a1 1 0 001.414 1.414L12.414 11H15.5a.5.5 0 000-1h-3.086l2.293-2.293a1 1 0 00-1.414-1.414L10 9.586l-2.293-2.293a1 1 0 00-1.414 1.414L9.586 11H6.5a.5.5 0 000 1h3.086z" clipRule="evenodd" />
              </svg>
              {downvotes}
            </button>
          </div>
          <div className="flex items-center ml-auto">
            <span className="text-lg font-bold text-white mr-1">{netVotes}</span>
            <span className="text-sm text-gray-400">Net Votes</span>
          </div>
        </div>
      </div>
    </div>
  );
}