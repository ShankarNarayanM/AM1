const express = require('express')
const Axios = require('axios')

const app = express()


function f2(req, res, avail_keywords){
    let prefixResult = [];
    let valid_keywords = new Array();
    let keywords = req.query.keywords
    if(typeof(keywords) != "string"){
        return "Enter a query in URL";
    }
    
    keywords = keywords.split(',')
    keywords.map((val)=>{
        if(avail_keywords.includes(val))
        {
            valid_keywords.push(val);
        }
        else{
            valid_keywords.push('n/a')
        }
    })

    for (let i = 0; i < valid_keywords.length; i++) {
        const currentWord = valid_keywords[i];
        if(currentWord === 'n/a')
        {
            prefixResult.push('not applicable')
            continue;
        }
        let shortestUniqueFound = false;

        for (let j = 1; j <= currentWord.length; j++) {
            const currentPrefix = currentWord.substring(0, j); // Get the prefix
            let isUnique = true; // Assume this prefix is unique initially

            for (let k = 0; k < valid_keywords.length; k++) {
                if (i === k) {
                    continue;
                }

                const otherWord = valid_keywords[k];

                if (otherWord.startsWith(currentPrefix)) {
                    isUnique = false;
                    break; // No need to check further words for this prefix
                }
            }

            if (isUnique) {
                prefixResult.push(currentPrefix); // Add it to the result
                shortestUniqueFound = true;  // Mark that a unique prefix was found
                break; // Move to the next word in the outer loop, as we found the shortest unique one
            }
        }

        if (!shortestUniqueFound) {
            prefixResult.push(currentWord);
        }
    }
    
    let response = new Array()

    for(let i=0;i<valid_keywords.length;i++)
    {
        let status = avail_keywords.includes(keywords[i]) ? "found" : "not found"
        response.push({"keyword":keywords[i],"status":status,"prefix":prefixResult[i]})
    }

    return response
}


app.get('/',(req, res)=>{
    const avail_keywords = ["java", "python"]
    async function f1(){
        await Axios.get('https://mocki.io/v1/ed6a8ece-6536-4898-8a4c-7121f2d7e052')
        .then(async (data)=>{
            let arr = await data.data.keywords
            arr.forEach(element => {
                avail_keywords.push(element)
            });
            res.send(f2(req, res, avail_keywords));
        })
        .catch((err)=>console.log(err))
    }
    f1();
})

app.listen(5500,()=>{
    console.log("Server started at 5500")
})
