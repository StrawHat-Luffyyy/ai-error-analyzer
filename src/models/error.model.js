import mongoose from "mongoose";

const errorSchema = new mongoose.Schema({
  input : {
    type : string ,
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
})

export default mongoose.model("ErrorLog" , errorSchema)