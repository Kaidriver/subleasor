// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  typescript: {
    typeCheck: true
  },
  runtimeConfig: {
    public: {
      secret: process.env.GOOGLE_API_KEY,
      dev_endpoint: process.env.DEV_ENDPOINT,
      aws_api_key: process.env.AWS_API_KEY
    }
  }
})
