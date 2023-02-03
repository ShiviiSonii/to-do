
//jsversionE6
module.exports=userauth;

function userauth(){
async function main(){
    mongoose.set("strictQuery",true);

    await mongoose.connect("mongodb://127.0.0.1:27017/userDB");
    const userSchema ={
        email:String,
        password:String
    };
    
    const User= new mongoose.model("User",userSchema);
    
    app.post("/register",function(req,res){
        const newUser= new User({
            email:req.body.username,
            password:req.body.password
        });
    
    
    newUser.save(function(err){
        if(err){
            console.log(err);
        }
        else {
            let listdata=res.render("list");
        }
    });
    });
    
    
    app.post("/login",function(req,res){
      const username=req.body.username;
      const password=req.body.password;
    
      User.findOne({email:username},function(err,foundUser){
        if(err){
            console.log(err);
        }
        else {
            if(foundUser){
                if(foundUser.password===password){
                    let listdata=res.render("list");
                }
            }
        }
      });
    });

    return listdata;
}

}
