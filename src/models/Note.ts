import { Schema, model, Types } from 'mongoose'

const NoteSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, default: '' },
  userId: { type: Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true })

export const Note = model('Note', NoteSchema)
