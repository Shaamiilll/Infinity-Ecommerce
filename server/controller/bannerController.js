module.exports={
    deleteBanner:async(req,res)=>{
        const id=req.query.id
      
        await Banner.updateOne({_id:id},{$set:{active:false}})
        res.redirect('/admin-banner')
      },
      
      
      restoreBanner:async(req,res)=>{
        const id=req.query.id
      
        await Banner.updateOne({_id:id},{$set:{active:true}})
        res.redirect('/admin-banner')
      },
      UpdateBanner:async(req,res)=>{
        console.log(req.body.title);
        console.log(req.body.image);
      }
}