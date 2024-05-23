export {}

declare global {
    interface Property {
        property_id: string
        username: string
        street: string
        street2: string
        city: string
        st: string
        postal: number
        coordinates: string
        geojson: string 
        post_date: string
    }

}