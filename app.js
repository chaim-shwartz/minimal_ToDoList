//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-chaim:Test123@cluster0.n1jx0.mongodb.net/toDoListDB");

const itemsSchema = {
  name: String
};

const itemsList = {
  name: String,
  items: [itemsSchema]
};

const Items = mongoose.model("item", itemsSchema);

const List = mongoose.model("List", itemsList);

const item1 = new Items({
  name: "smart"
});

const item2 = new Items({
  name: "phone"
});

const item3 = new Items({
  name: "chaim"
});

const itemsArr = [item1,item2,item3];

  
app.get("/", function(req, res) {
  Items.find({},function (err, foundItems) {
    if (foundItems.length===0) {
      console.log(itemsArr.length);
      Items.insertMany(itemsArr, function (err) {
        if(err){
          console.log(err);
        }
        else{
          console.log("successfully insert");
        }
      });
      res.redirect("/");
    }
    else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  console.log(listName)

  const item = new Items({
    name: itemName
  });
  if (listName==="Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function (err,foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName)

      });
    
  }
  
 
});


app.post("/deleteoredit", function (req,res) {
  const itemId = req.body.delete;
  const listName = req.body.listName;
  if (listName==="Today") {
    Items.findByIdAndRemove(itemId, function (err) {
      if(!err){
        console.log("successfully removed");
      }
      });
      res.redirect("/")
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemId}}},function (err, findList) { 
      if(!err){
        res.redirect("/"+ listName)
      }
     });
  }
  console.log(req.body)
 
  });





app.get("/:thePage", function(req,res){
  const thePage = _.capitalize(req.params.thePage);

  List.findOne({name: thePage},function (err, itemFound) { 
    if(!err)
    {
      if (!itemFound) {
        const listItem = new List({
          name: thePage,
          items: itemsArr
        });
        listItem.save();
        res.redirect("/"+thePage);
      } else {
        res.render("list", {listTitle: itemFound.name, newListItems: itemFound.items});
      }
    }
   })
  

});

app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port==null||port == "") {
  port =3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
