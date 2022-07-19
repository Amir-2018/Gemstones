const csvdb = require('csv-database');
const express = require('express');
const app = express()
const port = 3000
var sqlite3 = require('sqlite3');
var bodyParser = require('body-parser')
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }))
async function runQueries(db,req,res) {
    
    return new Promise((resolve, reject) => {
        var obj = req.body 
        var result=[]
        
        // delete properties with null value

        Object.keys(obj).forEach(key => {
            if (obj[key] === null) {
              delete obj[key];
            }
        });
        // delete null values from json format request
        ch = "select * from `nat` where " ;
        ch1 = ch
        for (const [key, value] of Object.entries(obj)) {
        if(`${key}`=="size_range"){
            var ranged_size = `${value}`.split(',');
            if((ranged_size).includes("max")){
                ch +="and carats"+"="+JSON.stringify(ranged_size[0])+""
            }else if(ranged_size.includes("min")){
                ch +="and carats"+"="+JSON.stringify(ranged_size[1])+""
            }else{
                
                ch +=" and carats "+"BETWEEN "+(ranged_size[0])+" AND "+(ranged_size[1])
                
            }
        }else{
                /******************************************************* */
                    if(JSON.stringify(`${value}`).includes(",")){
                        var words = `${value}`.split(',');
                        var count = 0 ; 
                        for(var a=0;a<words.length;a++){
                        count ++ ;
                            if(count==1 && (ch.length != ch1.length)){
                                ch +=" and "+`${key}`+"="+JSON.stringify(words[a])
                            }else{
                                if(ch.length == ch1.length )
                                    ch +=`${key}`+"="+JSON.stringify(words[a])+""   
                                else
                                    ch +=" or "+`${key}`+"="+JSON.stringify(words[a])
                            }
                                                
                        }
                    }else
                    {
                        if(ch.length == ch1.length ){
                        
                            ch +=`${key}`+"="+JSON.stringify(`${value}`)
                        }else
                            ch +=" and "+`${key}`+"="+JSON.stringify(`${value}`)
                    
                    }
                }

                /********************************************************************** */
        }
        db.all(ch,(err, rows) => {
            console.log("request = "+ch)

                rows.forEach(row => {

                    result.push(row);          
                });

            //
            if (err)
            {                
                reject(err); 
            } // I assume this is how an error is thrown with your db callback
           
            resolve(result);
        })
    });
}

app.get('/test', async(req, res)=> {
    res.status(200).json({
        message : "Working well"
    })
})
app.post('/getAll', async(req, res)=> {
    res.status(200).json({
        message : "Working well"
    })
})
app.post('/', async(req, res)=> {

   
    var db=new sqlite3.Database('./nat.db', sqlite3.OPEN_READONLY, (err) => {
        if (err && err.code == "SQLITE_CANTOPEN") {
            
           console.log("cant oppen console");
            return;
            } else if (err) {
                console.log("Getting error " + err);
                exit(1);
        }
        
        
    });
    // result=  await runQueries(db);
if((Object.keys(req.body).length)==0){
    res.status(500).json({
        message : "No data founded"
      })
}else{
    //res.status(200).json({
       // message : await runQueries(db,req,res)
       res.send(await runQueries(db,req,res))
       console.log(ch)
      //})
}

  
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)})
