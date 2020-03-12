//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser: true});

const itemsSchema=
{
  name: String
};

const listSchema=
{
  name: String,
  items: [itemsSchema]
};

const List=mongoose.model("List",listSchema);
const Item= mongoose.model("Item",itemsSchema);




app.get("/", function(req, res) {

Item.find({},function(err,foundItems)
{

    res.render("list", {listTitle: "Today", newListItems: foundItems});


});


});

app.post("/", function(req, res){

  const itemName = (req.body.newItem);
  const listName= req.body.list;
  const item_n=new Item(
  {
    name: itemName
  });


    if(listName === "Today")
    {
      item_n.save();
      res.redirect("/");

    }
    else
    {
      List.findOne({name: listName},function(err,flistN)
      {
        flistN.items.push(item_n);
        flistN.save();
        res.redirect("/"+listName);

      });

    }
});

app.get("/:customListName",function(req,res)
{
  const customName= _.capitalize(req.params.customListName);
  List.findOne({name: customName},function(err,flist)
  {
    if(!err)
    {
      if(!flist)
      {
        const list=new List({
          name: customName,
          items: []
        });
        list.save();
        res.redirect("/"+customName);
      }
      else
      {
        res.render("list",{listTitle:flist.name, newListItems: flist.items});

      }
    }
  });


});
app.post("/delete",function(req,res)
{
  const delItem=req.body.checkbox;
  const lname=_.capitalize(req.body.listname);
  if(lname==="Today")
  {
    Item.findByIdAndRemove(delItem,function(err)
    {
      if(!err)
      {
        res.redirect("/");
      }
    });
  }
  else
  {
    List.findOneAndUpdate({name: lname},{$pull: {items: {_id: delItem}}},function(err,flist2)
    {
      if(!err)
      res.redirect("/"+lname);

    });
  }

});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
