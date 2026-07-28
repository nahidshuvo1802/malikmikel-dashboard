import Image from "next/image";
import { Tag, MapPin, Clock, Globe, Star, Image as ImageIcon, X } from "lucide-react";
import { getImageUrl } from "@/store/config/envConfig";

export const ViewServiceModal = ({
  isOpen,
  onClose,
  service,
}: {
  isOpen: boolean;
  onClose: () => void;
  service: any;
}) => {
  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 md:p-8 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/80 sticky top-0 z-20">
          <div>
            <h2 className="text-2xl font-black text-[#2E6F65] tracking-tight">
              {service.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              {service.cetagory?.name}{" "}
              {service.subCetagory?.name
                ? `• ${service.subCetagory?.name}`
                : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100 text-gray-400 hover:text-gray-600 hover:shadow-md transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 bg-white">
          {/* Image */}
          <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-md border border-gray-100">
            <Image
              src={getImageUrl(service.image) || "/placeholder.png"}
              alt={service.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#2E6F65]" /> About
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" /> Details
                </h3>
                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="flex items-start gap-3 text-sm text-gray-700">
                    <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <span>{service.address}</span>
                  </p>
                  {service.cetagory?.name?.toLowerCase() !== "events" ? (
                    <p className="flex items-center gap-3 text-sm text-gray-700">
                      <Clock className="w-5 h-5 text-gray-400 shrink-0" />
                      <span>
                        {service.openTime || "N/A"} -{" "}
                        {service.closeTime || "N/A"}
                      </span>
                    </p>
                  ) : (
                    <>
                      <p className="flex items-center gap-3 text-sm text-gray-700">
                        <Clock className="w-5 h-5 text-gray-400 shrink-0" />
                        <span>
                          {service.date
                            ? new Date(service.date).toLocaleDateString()
                            : "N/A"}{" "}
                          | {service.startTime || "N/A"} -{" "}
                          {service.endTime || "N/A"}
                        </span>
                      </p>
                      {service.venue && (
                        <p className="flex items-start gap-3 text-sm text-gray-700">
                          <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>Venue:</strong> {service.venue}
                          </span>
                        </p>
                      )}
                      {service.ticketPrice && (
                        <p className="flex items-start gap-3 text-sm text-gray-700">
                          <Tag className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>Tickets:</strong> {service.ticketPrice}
                          </span>
                        </p>
                      )}
                      {service.organiser && (
                        <p className="flex items-start gap-3 text-sm text-gray-700">
                          <Globe className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>Organiser:</strong> {service.organiser}
                          </span>
                        </p>
                      )}
                      {service.ageRestriction && (
                        <p className="flex items-start gap-3 text-sm text-gray-700">
                          <span className="w-5 h-5 flex items-center justify-center text-gray-400 shrink-0 text-xs font-bold mt-0.5 border border-gray-400 rounded">
                            18+
                          </span>
                          <span>
                            <strong>Age:</strong> {service.ageRestriction}
                          </span>
                        </p>
                      )}
                      {service.dressCode && (
                        <p className="flex items-start gap-3 text-sm text-gray-700">
                          <span className="w-5 h-5 text-gray-400 shrink-0 flex items-center justify-center mt-0.5">
                            👕
                          </span>
                          <span>
                            <strong>Dress Code:</strong> {service.dressCode}
                          </span>
                        </p>
                      )}
                      {service.parkingInfo && (
                        <p className="flex items-start gap-3 text-sm text-gray-700">
                          <span className="w-5 h-5 text-gray-400 shrink-0 flex items-center justify-center mt-0.5">
                            🅿️
                          </span>
                          <span>
                            <strong>Parking/Transport:</strong>{" "}
                            {service.parkingInfo}
                          </span>
                        </p>
                      )}
                      {service.ticketLink && (
                        <p className="flex items-center gap-3 text-sm text-gray-700">
                          <Globe className="w-5 h-5 text-gray-400 shrink-0" />
                          <a
                            href={
                              service.ticketLink.startsWith("http")
                                ? service.ticketLink
                                : `https://${service.ticketLink}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Book Tickets
                          </a>
                        </p>
                      )}
                    </>
                  )}
                  <p className="flex items-center gap-3 text-sm text-gray-700">
                    <Star className="w-5 h-5 text-yellow-500 fill-current shrink-0" />
                    <span>
                      <span className="font-bold text-gray-900">
                        {service.averageRating?.toFixed(1) || "0.0"}
                      </span>{" "}
                      ({service.totalReviews || 0} reviews)
                    </span>
                  </p>
                  {service.serviceLink && (
                    <p className="flex items-center gap-3 text-sm text-gray-700">
                      <Globe className="w-5 h-5 text-gray-400 shrink-0" />
                      <a
                        href={
                          service.serviceLink.startsWith("http")
                            ? service.serviceLink
                            : `https://${service.serviceLink}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {service.serviceLink}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {service.photoOfVisitor?.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-3 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-500" /> Gallery
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {service.photoOfVisitor.map(
                      (photo: string, idx: number) => (
                        <div
                          key={idx}
                          className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-100 hover:scale-105 transition-transform shadow-sm"
                        >
                          <Image
                            src={getImageUrl(photo)}
                            alt="Gallery"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {service.hotelMenu?.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-3 mt-4 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-orange-500" /> Menu
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {service.hotelMenu.map((photo: string, idx: number) => (
                      <div
                        key={idx}
                        className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-100 hover:scale-105 transition-transform shadow-sm"
                      >
                        <Image
                          src={getImageUrl(photo)}
                          alt="Menu"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reviews */}
          {service.cetagory?.name?.toLowerCase() !== "events" &&
            service.reviews?.length > 0 && (
              <div className="pt-4">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" /> Top
                  Reviews from Maps
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {service.reviews.map((revStr: string, idx: number) => {
                    try {
                      const revArray =
                        typeof revStr === "string"
                          ? JSON.parse(revStr)
                          : revStr;
                      const arrayToMap = Array.isArray(revArray)
                        ? revArray
                        : [revArray];

                      return arrayToMap.map((review: any, rIdx: number) => (
                        <div
                          key={`${idx}-${rIdx}`}
                          className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col gap-3 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            {review.profile_photo_url ? (
                              <Image
                                src={review.profile_photo_url}
                                alt={review.author_name}
                                width={40}
                                height={40}
                                className="rounded-full shadow-sm"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-500 shadow-sm">
                                {review.author_name?.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-sm text-gray-800 line-clamp-1">
                                {review.author_name}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span className="font-bold">
                                  {review.rating}
                                </span>{" "}
                                •{" "}
                                <span className="truncate max-w-[120px]">
                                  {review.relative_time_description}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-3 italic">
                            "{review.text}"
                          </p>
                        </div>
                      ));
                    } catch (e) {
                      return null;
                    }
                  })}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
