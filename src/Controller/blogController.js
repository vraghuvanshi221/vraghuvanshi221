
const  mongoose = require("mongoose")
let blogModel= require("../Model/blogModel")
const { query } = require('express');

let createBlog = async function (req, res) {
    try {
        let data = req.body;
        let newBlogObject = await blogModel.create(data)
        res.status(201).send({ status: true, data: newBlogObject })
    } catch (err) {
        res.status(500).send({ status: false, msg: "Internal problem" })
    }
}

// get by query
const getBlogs = async function (req, res) {
    try {
      let filter = {
        isdeleted: false,
        isPublished: true,
      ...data
      };
 
      const { authorId,category, subcategory, tags } = data
  
      if (category) {
        let verifyCategory = await blogModel.findOne({ category: category })
        if (!verifyCategory) {
          return res.status(404).send({ status: false, msg: 'No blogs in this category exist' })
        }
      }
      if (authorId) {
        let verifyCategory = await blogModel.findOne({ authorId: authorId })
        if (!verifyCategory) {
            return res.status(404).send({ status: false, msg: 'author id is not exists' })
        }
        let blogData = req.body;
        let updateBlog = await blogModel.findOneAndUpdate({ _id: blogId }, blogData);
        return res.status(200).send({ status: true, data: updateBlog });
    }
} catch (err) {
        return res.status(500).send({ status: false, msg: "Internal Server Error" })
    }
};
// updated by params
const updateBlog = async function (req, res) {
    try {
        let blogId = req.params.blogId

        let blog = await blogModel.findById(blogId);
        console.log(blog)

        if (!blog || blog.isdeleted == true) {
            return res.status(404).send({ status: false, msg: "no such blog exists" });
        };
        let blogData = req.body;
        let updateBlog = await blogModel.findOneAndUpdate({ _id: blogId }, blogData);
        return res.status(200).send({ status: true, data: updateBlog });
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: "Internal Server Error" })
    }
};


// delete By Id --> path params
const deleteById = async function (req, res) {

    let blog = req.params.blogId

    if (!blog) {
        return res.status(400).send({ status: false, msg: "blogId must be present in order to delete it" })
    }

    if (!mongoose.Types.ObjectId.isValid(blog)) {
        return res.status(404).send({ status: false, msg: "Please provide a Valid blogId" })
    }
    let fullObject = await blogModel.findOne({ _id: blog })

    if (fullObject.isPublished != false && fullObject.isdeleted == false) {
        let newData = await blogModel.findByIdAndUpdate(blog, { $set: { isdeleted: true } })
        res.status(200).send()
    }

    else
    {
        res.status(400).send({status:false,msg:"This data is not publised "})
    }  
  };

  




// delete using query params 
const deleteBlog = async function (req, res) {
    try {
        let queryData = req.query

        let filter = {
            isdeleted: false,
            isPublished: true,
            ...queryData
        };
        const { authorId, category, subcategory, tags } = queryData
        if (category) {
            let verifyCategory = await blogModel.findOne({ category: category })
            if (!verifyCategory) {
                return res.status(404).send({ status: false, msg: 'No blogs in this category exist' })
            }
        }
        if (authorId) {
            let verifyCategory = await blogModel.findOne({ authorId: authorId })
            if (!verifyCategory) {
                return res.status(404).send({ status: false, msg: 'author id is not exists' })
            }
        }
        if (tags) {

            if (!await blogModel.find({ tags: tags })) {
                return res.status(404).send({ status: false, msg: 'no blog with this tags exist' })
            }
        }

        if (subcategory) {

            if (!await blogModel.exists(subcategory)) {
                return res.status(404).send({ status: false, msg: 'no blog with this subcategory exist' })
            }
        }

        let getSpecificBlogs = await blogModel.find(filter);

        if (getSpecificBlogs.length == 0) {
            return res.status(404).send({ status: false, msg: "No blogs can be found" });
        }


        let deletedData = await blogModel.updateMany({ $set: { isdeleted: true } })
        res.status(200).send({ status: true, data: deletedData });


    }
    catch (error) {
        res.status(500).send({ status: false, err: error.message });
    }


};



module.exports = {
    getBlogs, deleteBlog, createBlog, updateBlog , deleteById
}

