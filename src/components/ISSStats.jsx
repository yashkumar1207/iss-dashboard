import React from 'react';
import { RefreshCw, Users, MapPin, Gauge } from 'lucide-react';

export function ISSStats({ position, speed, locationName, astronauts, loading, onRefresh }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-card text-card-foreground p-4 rounded-xl shadow-sm border flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1 flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Coordinates
          </p>
          {loading || !position ? (
            <div className="h-6 w-24 bg-muted animate-pulse rounded"></div>
          ) : (
            <p className="text-lg font-bold">
              {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
            </p>
          )}
        </div>
      </div>

      <div className="bg-card text-card-foreground p-4 rounded-xl shadow-sm border flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1 flex items-center gap-2">
            <Gauge className="h-4 w-4" /> Speed (km/h)
          </p>
          {loading ? (
            <div className="h-6 w-20 bg-muted animate-pulse rounded"></div>
          ) : (
            <p className="text-lg font-bold">
              {Math.round(speed).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      <div className="bg-card text-card-foreground p-4 rounded-xl shadow-sm border flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1 flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Nearest Place
          </p>
          {loading ? (
            <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
          ) : (
            <p className="text-sm font-bold line-clamp-2" title={locationName}>
              {locationName}
            </p>
          )}
        </div>
      </div>

      <div className="bg-card text-card-foreground p-4 rounded-xl shadow-sm border flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1 flex items-center gap-2">
            <Users className="h-4 w-4" /> People in Space
          </p>
          {!astronauts ? (
            <div className="h-6 w-16 bg-muted animate-pulse rounded"></div>
          ) : (
            <div className="group relative cursor-pointer">
              <p className="text-lg font-bold">{astronauts.number}</p>
              <div className="absolute top-full mt-2 left-0 w-48 bg-popover text-popover-foreground border shadow-lg rounded-md p-2 hidden group-hover:block z-50 text-sm">
                <ul className="space-y-1">
                  {astronauts.people.map((p, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{p.name}</span>
                      <span className="text-muted-foreground text-xs">{p.craft}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        <button 
          onClick={onRefresh}
          disabled={loading}
          className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors disabled:opacity-50"
          title="Manual Refresh"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}
