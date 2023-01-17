const express = require('express');
const router = express.Router();

router.get("/rt/:action?/:id?",(req,res)=>{
  const { url, baseUrl, originalUrl } = req;
  res.json({ url, baseUrl, originalUrl, params: req.params });
})

module.exports = router;