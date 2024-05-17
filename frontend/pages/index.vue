<template>
    <h1>hello</h1>

    <input type="text" id="pac-input">
    <ClientOnly>
        <ol-map id="map" ref="mapRef" :loadTilesWhileAnimating="true" :loadTilesWhileInteracting="true" style="height:400px">
            <ol-view :center="center" :rotation="rotation" :zoom="zoom"
            :projection="projection" />
            <ol-tile-layer>
                <ol-source-osm />
            </ol-tile-layer>
        </ol-map>
    </ClientOnly>
</template>

<style scoped>
    #map {
        width: 50%;
    }
</style>
<script setup lang="ts">
    import 'vue3-openlayers/dist/vue3-openlayers.css';
    
    import Point from 'ol/geom/Point.js'
    import Circle from 'ol/geom/Circle.js';
    import {Icon, Style} from 'ol/style'
    import Feature from 'ol/Feature.js'
    import * as olProj from 'ol/proj';
    import VectorLayer from 'ol/layer/Vector.js';
    import VectorSource from 'ol/source/Vector.js';

    import { ref } from 'vue'
    import type { Extent, Map } from 'openlayers';
    import type { BaseType } from 'typescript';

    const center = ref([40, 40])
    const projection = ref('EPSG:4326')
    const zoom = ref(8)
    const rotation = ref(0)
    const mapRef = ref<{ map: Map }>();
    const config = useRuntimeConfig()

    onMounted(() => {
        const mapsScript = document.createElement("script");
        console.log(config.public)
        console.log(`https://maps.googleapis.com/maps/api/js?key=${config.public.secret}&libraries=places`)
        mapsScript.setAttribute(
            "src",
            `https://maps.googleapis.com/maps/api/js?key=${config.public.secret}&libraries=places`
        );
        mapsScript.setAttribute(
            'language',
            'javascript'
        )
        
        mapsScript.onload = () => {
            const map: Map = mapRef.value?.map!;
            const centerPos = { lat: 50.064192, lng: -130.605469 };
            // Create a bounding box with sides ~10km away from the center point
            const defaultBounds = {
                north: centerPos.lat + 0.1,
                south: centerPos.lat - 0.1,
                east: centerPos.lng + 0.1,
                west: centerPos.lng - 0.1,
            };

            const input = document.getElementById("pac-input") as HTMLInputElement;
            const options = {
                bounds: defaultBounds,
                componentRestrictions: { country: "us" },
                fields: ["address_components", "geometry", "icon", "name"],
                strictBounds: false,
            };
            
            
            const autocomplete = new google.maps.places.Autocomplete(input, options);
            autocomplete.setFields(["place_id", "geometry", "name"]);
            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace()

                let extent: Extent = [place.geometry?.viewport.getSouthWest().lng()!,
                                        place.geometry?.viewport.getSouthWest().lat()!,
                                        place.geometry?.viewport.getNorthEast().lng()!, 
                                        place.geometry?.viewport.getNorthEast().lat()!]
                
                const newCenter: Array<number>= [place.geometry?.location.lng() as number, place.geometry?.location.lat() as number]
                const pointResolutionInMiles = olProj.getPointResolution(projection.value, 1, newCenter, 'ft')  / 5280;

                const circleExtent = new Circle(newCenter, 0.5 / pointResolutionInMiles)
            
                map.getView().fit(circleExtent.getExtent() as Extent, map.getSize() as any)
                console.log(extent)

                var poly = new Feature({
                    // geometry: new Polygon([[[place.geometry?.viewport.getSouthWest().lng()!, place.geometry?.viewport.getSouthWest().lat()!], 
                    //                         [place.geometry?.viewport.getSouthWest().lng()!, place.geometry?.viewport.getNorthEast().lat()!],
                    //                         [place.geometry?.viewport.getNorthEast().lng()!, place.geometry?.viewport.getNorthEast().lat()!], 
                    //                         [place.geometry?.viewport.getNorthEast().lng()!, place.geometry?.viewport.getSouthWest().lat()!]]]),
                    geometry: circleExtent
                }); 
                
                var markerGeometry = new Point(newCenter);
                var markerFeature = new Feature({
                    type: "marker",
                    geometry: markerGeometry
                });


                var vectorSource1 = new VectorSource({
                    features: [poly, markerFeature]
                });

                var vectorLayer1: VectorLayer<any> = new VectorLayer({
                    source: vectorSource1
                });

                map.addLayer(vectorLayer1 as any); 
                console.log(map.getView().calculateExtent(map.getSize()))
            })
            
        }

        document.head.appendChild(mapsScript);
    })

</script>