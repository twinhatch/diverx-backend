const mongoose = require("mongoose");
const News=mongoose.model("News")
module.exports = {
    postnews:async(req,res)=>{
        try {
            const data=req.body
            const newService=new News(data);
            const response=await newService.save();
            console.log('data saved');
            res.status(200).json(response);
        } catch (err) {
            console.log(err);
            res.status(500).json({error:'Internal Server Error'});
        }
    },
    getallnews:async(req,res)=>{
        try {
            const data=await News.find();
            console.log('data fetched');
            res.status(200).json(data);
        } catch (err) {
            console.log(err);
            res.status(500).json({error:'Internal Server Error'});
        }
    },
    // getservice:async(req,res)=>{
    //     try {
    //         const serviceid = await News.findById(
    //             req?.params?.id
    //           )
    //         console.log('data fetched');
    //         res.status(200).json(serviceid);
    //     } catch (err) {
    //         console.log(err);
    //         res.status(500).json({error:'Internal Server Error'});
    //     }
    // },
    updatenews:async(req,res)=>{
        try {
            const BasicdataId=req.params.id;
            const BasicdataData=req.body;
            const response=await News.findByIdAndUpdate(BasicdataId,BasicdataData,{
                new:true,//return the updateed document
                runValidators:true, //Run Mongoose validation
            }) ;
            if (!response) {
                return res.status(404).json({error:'Service not found'}); 
            } 
            console.log('data updated');
            res.status(200).json(response);
            
        } catch (err) {
            console.log(err);
            res.status(500).json({error:'Internal Server Error'});
        }

    },
    deletenews:async(req,res)=>{
        try {
            const BasicdataId=req.params.id;
            const response=await News.findByIdAndRemove(BasicdataId) ;
            if (!response) {
                return res.status(404).json({error:'Person not found'}); 
            } 
            console.log('data updated');
            res.status(200).json(response);
            
        } catch (err) {
            console.log(err);
            res.status(500).json({error:'Internal Server Error'});
        }
    },
}