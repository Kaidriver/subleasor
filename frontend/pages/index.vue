<template>
    <h1>hello</h1>

    <input type="text" id="pac-input">
    <ol-map id="map" ref="mapRef" :loadTilesWhileAnimating="true" :loadTilesWhileInteracting="true" style="height:400px">
        <ol-view :center="center" :rotation="rotation" :zoom="zoom"
        :projection="projection" />
        <ol-tile-layer>
            <ol-source-osm />
        </ol-tile-layer>
    </ol-map>   
    <div id="popup" class="ol-popup">
      <a href="#" id="popup-closer" class="ol-popup-closer"></a>
      <div id="popup-content"></div>
    </div>
</template>

<style scoped>
    #map {
        width: 50%;
    }
    .ol-popup {
        position: absolute;
        background-color: white;
        box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        padding: 15px;
        border-radius: 10px;
        border: 1px solid #cccccc;
        bottom: 12px;
        left: -50px;
        min-width: 280px;
      }
      .ol-popup:after, .ol-popup:before {
        top: 100%;
        border: solid transparent;
        content: " ";
        height: 0;
        width: 0;
        position: absolute;
        pointer-events: none;
      }
      .ol-popup:after {
        border-top-color: white;
        border-width: 10px;
        left: 48px;
        margin-left: -10px;
      }
      .ol-popup:before {
        border-top-color: #cccccc;
        border-width: 11px;
        left: 48px;
        margin-left: -11px;
      }
</style>
<script setup lang="ts">
    import 'vue3-openlayers/dist/vue3-openlayers.css';
    
    import Point from 'ol/geom/Point.js'
    import Circle from 'ol/geom/Circle.js';
    import Overlay from 'ol/Overlay.js';
    import {Icon, Style} from 'ol/style'
    import Feature from 'ol/Feature.js'
    import * as olProj from 'ol/proj';
    import VectorLayer from 'ol/layer/Vector.js';
    import VectorSource from 'ol/source/Vector.js';
    import GeoJSON from 'ol/format/GeoJSON.js'; 
    import { ref } from 'vue'
    import type { Extent, Map } from 'openlayers';

    const center = ref([40, 40])
    const projection = ref('EPSG:4326')
    const zoom = ref(8)
    const rotation = ref(0)
    const mapRef = ref<{ map: Map }>();
    const config = useRuntimeConfig()

    async function queryPropertiesFromView(map: Map) {
        const queryExtent = map.getView().calculateExtent(map.getSize())
        const queryPolygon = encodeURI("POLYGON((" + queryExtent[0] + " " + queryExtent[1] + ", " 
                                            + queryExtent[0] + " " + queryExtent[3] + ", " 
                                            + queryExtent[2] + " " + queryExtent[3] + ", " 
                                            + queryExtent[2] + " " + queryExtent[1] + ", "
                                            + queryExtent[0] + " " + queryExtent[1] + "))")
        
        const { data, pending, error, refresh } = await useFetch(config.public.dev_endpoint + queryPolygon, {
            headers: {
                'x-api-key': config.public.aws_api_key
            }   
        })
        

        let properties = JSON.parse(JSON.stringify(data.value))
        let featuresList = []
        for (let i = 0; i < properties.length; i++) {
            featuresList.push({'type': 'Feature', 'geometry': JSON.parse(properties[i].geojson), 'properties': {
                'address': properties[i].street + " " + (properties[i].street2 == null ? "" : properties[i].street2 + " ") + ", " + properties[i].city + " " + properties[i].st + ", " + properties[i].postal,
                'post_date': properties[i].post_date
            }})
        }

        let geojsonObject = {
            'type': 'FeatureCollection',
            'crs': {
                'type': 'name',
                'properties': {
                    'name': 'EPSG:3857',
                }, 
            },
            'features': featuresList
        }

        return new GeoJSON().readFeatures(geojsonObject)
    }

    onMounted(() => {
        const container = document.getElementById('popup')!;
        const content = document.getElementById('popup-content')!;

        const mapsScript = document.createElement("script");
        mapsScript.setAttribute(
            "src",
            `https://maps.googleapis.com/maps/api/js?key=${config.public.secret}&libraries=places`
        );
        mapsScript.setAttribute(
            'language',
            'javascript'
        )
        
        const map: Map = mapRef.value?.map!;
        var vectorSource1 = new VectorSource();

        var vectorLayer1: VectorLayer<any> = new VectorLayer({
            source: vectorSource1
        });

        map.addLayer(vectorLayer1 as any); 

        const overlay = new Overlay({
            element: container,
            autoPan: {
                animation: {
                duration: 250,
                },
            },
        });
        map.addOverlay(overlay as any)

        map.on("moveend", async function(e){
            let newFeatures = await queryPropertiesFromView(map)
            vectorSource1.addFeatures(newFeatures)
        });
        
        mapsScript.onload = () => {
            const input = document.getElementById("pac-input") as HTMLInputElement;
            const centerPos = { lat: 50.064192, lng: -130.605469 };
            // Create a bounding box with sides ~10km away from the center point
            const defaultBounds = {
                north: centerPos.lat + 0.1,
                south: centerPos.lat - 0.1,
                east: centerPos.lng + 0.1,
                west: centerPos.lng - 0.1,
            };
        
            const options = {
                bounds: defaultBounds,
                componentRestrictions: { country: "us" },
                fields: ["address_components", "geometry", "icon", "name"],
                strictBounds: false,
            };
            
            
            const autocomplete = new google.maps.places.Autocomplete(input, options);
            autocomplete.setFields(["place_id", "geometry", "name"]);
            autocomplete.addListener("place_changed", async () => {
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

                markerFeature.addEventListener('mouseover', () => {
                    alert("hover!")
                })

                let retrieveFeatures = await queryPropertiesFromView(map)
                vectorSource1.addFeatures([poly, markerFeature, ...retrieveFeatures])
                

                map.on('pointermove', function (e: any) {
                    let onFeature = false
                    map.forEachFeatureAtPixel(e.pixel, function (f) {
                        //TODO: in case of duplicate hover (more than one property), add on to overlay instead of setting it
                        //also remove if statement
                        if (f.get("address") != undefined) {
                            content.innerHTML=`<p>${f.get("address")}`
                            overlay.setPosition(e.coordinate)
                            console.log(e.coordinate)

                            onFeature = true
                        }
                    });

                    if (!onFeature) {
                        overlay.setPosition(undefined)
                    }
                });
            })
            
        }

        document.head.appendChild(mapsScript);
    })

    // const { data, pending, error, refresh } = await useFetch('https://xzdo7h9g8c.execute-api.us-east-1.amazonaws.com/dev/get_properties', {
    //     headers: {
    //         'x-api-key': 'IQCzLPuwx27iDJAS1R6XW6LCaUmDeGPp6DUgyA5e'
    //     }   
    // })

    // console.log((data.value as Array<any>)[0].username)
</script>