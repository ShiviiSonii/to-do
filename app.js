//jshint esversion:6
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const _ =require("lodash");
const user=require(__dirname+"/user.js");
const app=express();

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));

app.get("/",function(req,res){
    res.render("home");
});

main().catch(err =>console.log(err));

async function main(){
    mongoose.set("strictQuery",true);
    await mongoose.connect("mongodb://127.0.0.1:27017/todolistdb");
    
    let use=user();

    const itemSchema = new mongoose.Schema({
        name:String
    });
    
    const Item= mongoose.model("Item",itemSchema);
    
    const item1= new Item ({
        name:"Welcome to your ToDo list"
    });
    
    const item2= new Item ({
        name:"Hit the + button to add a new item."
    });
    
    const item3= new Item ({
        name:"<--Hit this to delete an item"
    });
    
    const defaultItems=[item1,item2,item3];
    
    const listSchema ={
        name:String,
        items:[itemSchema]
    };
    
    const List=mongoose.model("List",listSchema);
    
    app.get("/",function(req,res){
        let today= new Date();
        
        let options={
            weekday:"long",
            day:"numeric",
            month:"long"
        };
        let day=today.toLocaleDateString("en-US",options);
    
        Item.find({},function(err,foundItems){
            if(err){
                console.log(err);
            }
            else{
                if(foundItems.length === 0){
                    Item.insertMany(defaultItems,function(err){
                        if(err){
                            console.log(err);
                        }
                        else{
                            console.log("Successfully Saved default items to db");
                        }
                    });
                    res.redirect("/");
                }
                else{
                  res.render("list",{kindOfDay:day,newlistItems:foundItems});  
                } 
            }
        });
    
    });
    
    
    
        app.get("/:customListName",function(req,res){
         const customListName=_.capitalize(req.params.customListName); 
         
         List.findOne({name:customListName},function(err,foundList){
            if(!err){
                if(!foundList){
                    const list=new List({
                        name:customListName,
                        items:defaultItems
                     });
                
                     list.save();
                    console.log("Doesn't Exist");
                    res.redirect("/" + customListName) ;
                } else{
                    res.render("list",{kindOfDay:foundList.name,newlistItems:foundList.items});
                    console.log("Exists");
                }
            }
         });
    
        
     });
        
    
    
        app.post("/",function(req,res){
            const itemName= req.body.newitem;
            const listName=req.body.list;
          
            const item = new Item({
                name:itemName
            });
    
    
            if(listName ==="day"){
             item.save();
        res.redirect("/");
            }
            else{
                List.findOne({name:listName},function(err,foundList){
                    foundList.items.push(item);
                    foundList.save();
                    res.redirect("/"+listName);
                });
            }
        
        });
    
    
    
    app.post("/delete",function(req,res){
        const checkedItemId=req.body.checkbox;
        const listName=req.body.listName;
    
        if(listName==="day"){
            Item.findByIdAndRemove(checkedItemId,function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Successfully Deleted");
                }
                res.redirect("/");
            });
        
        }
        else{
         List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
            if(!err){
                res.redirect("/"+listName);
            }
         });
        }
    
    });
    
}


// async function main(){
//     mongoose.set("strictQuery",true);

//     

//}



app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});


app.listen(3000,function(req,res){
        console.log("Server is running on port 3000.");
});


