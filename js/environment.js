if (!process.env.API_BASE_URL || !process.env.API_KEY){
    throw new Error("Error crítico, faltan variables de entorno esenciales.")
}

export const environment = {
    ApiKey: process.env.API_KEY,
    ApiBaseUrl: process.env.API_BASE_URL
}
