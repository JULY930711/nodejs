const express = require('express');
const router = express.Router();
const db = require('./../modules/db-connection');
const moment = require('moment-timezone');
const upload = require('../modules/upload-imgs');

const getListData = async (req) => {
  let redirect = '';
  let page = +req.query.page ||1;
  page = parseInt(page);
  const perPage = 25;
  if (page < 1) {
    redirect = req.baseUrl; // 轉向到別頁
  }
  // 算總筆數
  const [[{ totalRows }]] = await db.query(
    "SELECT COUNT(1) totalRows FROM address_book"
  );
  const totalPages = Math.ceil(totalRows / perPage); // 總頁數

  let rows = [];
  if (totalRows > 0) {
    if(page > totalPages){
      redirect = req.baseUrl + `?page=`+totalPages; // 轉向到別頁
    }
    const sql = `SELECT * FROM address_book 
      ORDER BY sid DESC 
      LIMIT ${(page-1)*perPage}, ${perPage}`;
      [rows] = await db.query(sql);
  }

  // res.json({
  //   totalRows,
  //   totalPages,
  //   perPage,
  //   page,
  //   rows,
  // });
    // 轉換 Date 類型的物件變成格式化的字串
    const fm = 'YYYY-MM-DD';
    rows.forEach(v=>{
      v.birthday2 = moment(v.birthday).format(fm);
    });
 return{
    totalRows,
    totalPages,
    perPage,
    page,
    rows,
  };
};

router.get("/add", async (req, res) => {
  res.render('address_book/add');
});
router.post("/add",upload.none(), async (req, res) => {

  let{name,email,mobile,birthday,address} = req.body;
  const sql ="INSERT INTO `address_book`( `name`, `email`, `mobile`, `birthday`, `address`, `created_at`) VALUES (?,?,?,?,?,NOW())";
  const [result] = await db.query(sql, [name, email, mobile, birthday, address]);
  res.json({
    success: !! result.affectedRows,
    postData: req.body,
    result
  });
});

router.get("/edit/:sid", async (req, res) => {
  const sql = "SELECT * FROM address_book WHERE sid=?";

  const [rows] = await db.query(sql, [req.params.sid]);

  if(rows.length){
    // res.render('address-book/edit', {row: rows[0]});  // 呈現編輯的表單
   res.render('address_book/edit',{...rows[0], Referer: req.get('Referer') || ''})
  } else {
    res.redirect(req.baseUrl);
  }

});
router.put("/edit/:sid",upload.none(), async (req, res) => {
  let sid = req.params.sid;
  let{name,email,mobile,birthday,address} = req.body;
  const sql = "UPDATE `address_book` SET `name`=?,`email`=?,`mobile`=?,`birthday`=?,`address`=? WHERE `sid`=? ";
  const [result] = await db.query(sql, [name, email, mobile, birthday, address,sid]);
  res.json({
    success: !! result.changedRows,
    postData: req.body,
    result
  });
});

router.delete('/:sid', async (req, res) => {
  //req.params.sid
  const sql = "DELETE FROM address_book WHERE sid=?";
  const [result] = await db.query(sql, [req.params.sid]);
  res.json(result);
});

router.get("/", async (req, res) => {
  const output = await getListData(req);
  if(output.redirect){
    return res.redirect(output.redirect);
  }
  res.render('address_book/list', output);
});

router.get("/api", async (req, res) => {
  res.json( await getListData(req) );
});



module.exports = router;