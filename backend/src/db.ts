import mongoose from 'mongoose'
import { env } from './config.js'

export async function connectMongo() {
  mongoose.set('strictQuery', true)
  await mongoose.connect(env.mongoUri)
  console.log('[mongo] connected')
}
