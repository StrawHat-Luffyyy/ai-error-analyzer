import mongoose from "mongoose";

const errorSchema = new mongoose.Schema({
  input : {
    type : String ,
    required : true
  } , 
  analysis : {
    summary : String,
    rootCause : String , 
    suggestedFix : String
  },
  aiModel : String,
  createdAt : {
    type : Date,
    default : Date.now
  },
  responseTime : Number,
  status : {
    type : String ,
    enum : ['success' , 'failed'],
    default : 'success'
  }
} , {
  timestamps : true
})

export default mongoose.model("ErrorLog" , errorSchema)