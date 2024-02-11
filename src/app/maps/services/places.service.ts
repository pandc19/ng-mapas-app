import { Injectable } from '@angular/core';
import { Feature, PlacesResponse } from '../interfaces/places.interface';
import { PlacesApiClient } from '../api';
import { MapService } from './map.service';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  public userLocation?: [number, number] | undefined;
  public isLoadingPlaces: boolean = false;
  public places: Feature[] = [];

  get isUserLocationReady(): boolean {
    return !!this.userLocation;
  }

  constructor(
    private placesApi: PlacesApiClient,
    private mapService: MapService,
  ) {
    this.getUserLocation();
  }

  getUserLocation(): Promise<[number, number]> {

    return new Promise((resolve, reject) => {

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          this.userLocation = [coords.longitude, coords.latitude];
          resolve(this.userLocation);
        },
        (err) => {
          alert('No se pudo obtener la geolocalización');
          console.log(err);
          reject();
        }
      );

    });
  }

  getPlacesByQuery(query: string = '') {
    if (query.length === 0) {
      this.places = [];
      this.isLoadingPlaces = false;

      return;
    }

    if (!this.userLocation) throw Error('No hay user location');

    this.isLoadingPlaces = true;

    this.placesApi.get<PlacesResponse>(`/${query}.json?`, {
      params: {
        proximity: this.userLocation!.join(','),
      }
    })
      .subscribe(resp => {
        // console.log(resp.features);

        this.isLoadingPlaces = false;
        this.places = resp.features;

        this.mapService.createMarkersFromPlaces(this.places, this.userLocation!);
      });
  }

  deletePlaces() {
    this.places = [];
  }
}
