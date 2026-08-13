
function rsa_decode(N,e,c){
    
    function abs(n){
        return n > 0n ? n : -n;
    }

    function exgcd(a,b){
        if(b == 0n){
            return [a,1n,0n];
        }
        let [gd,xx,yy] = exgcd(b,a%b);
        //let x = yy;
        //let y = xx - a/b*yy;
        return [gd,yy,xx - (a/b)*yy];
    }

    //mod inverse
    function md_in(a,m){
        let [gd,x,] = exgcd(a,m);
        if(gd > 1n){
            return -1n;
        }
        return (x%m+m)%m;
    }

    // fast_pow
    function fp(a,b,m){
        if(b < 0n){
            a = md_in(a,m);
            b = -b;
        }
        if(b === 0n){
            return 1n;
        }
        if(b%2n === 1n){
            return (a*fp(a,b-1n,m))%m;
        }
        let tmp = fp(a,b/2n,m);
        return (tmp*tmp)%m;
    }

    function rd(mi,mx){
        const range=mx-mi;
        let rdS = '';
        for(let i = 0; i < range.toString().length; i++){
            rdS += Math.floor(Math.random() * 10).toString();
        }
        return (BigInt(rdS) % (range + 1n)) + mi;

    }

    //====================================================================================

    function func(x,c,n){
        return (x*x+c)%n;
    }

    let pri = [2n,3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n,41n,43n,47n,53n,59n,61n,67n,71n,73n,79n,83n,89n,97n,101n,103n,107n,109n,113n,127n,131n,137n,139n,149n,151n,157n,163n,167n,173n,179n,181n,191n,193n,197n,199n,211n,223n,227n,229n,233n,239n,241n,251n,257n,263n,269n,271n,277n,281n,283n,293n,307n,311n,313n,317n,331n,337n,347n,349n,353n,359n,367n,373n,379n,383n,389n,397n,401n,409n,419n,421n,431n,433n,439n,443n,449n,457n,461n,463n,467n,479n,487n,491n,499n,503n,509n,521n,523n,541n,547n,557n,563n,569n,571n,577n,587n,593n,599n,601n,607n,613n,617n,619n,631n,641n,643n,647n,653n,659n,661n,673n,677n,683n,691n,701n,709n,719n,727n,733n,739n,743n,751n,757n,761n,769n,773n,787n,797n,809n,811n,821n,823n,827n,829n,839n,853n,857n,859n,863n,877n,881n,883n,887n,907n,911n,919n,929n,937n,941n,947n,953n,967n,971n,977n,983n,991n,997n,1009n,1013n,1019n,1021n,1031n,1033n,1039n,1049n,1051n,1061n,1063n,1069n,1087n,1091n,1093n,1097n,1103n,1109n,1117n,1123n,1129n,1151n,1153n,1163n,1171n,1181n,1187n,1193n,1201n,1213n,1217n,1223n,1229n,1231n,1237n,1249n,1259n,1277n,1279n,1283n,1289n,1291n,1297n,1301n,1303n,1307n,1319n,1321n,1327n,1361n,1367n,1373n,1381n,1399n,1409n,1423n,1427n,1429n,1433n,1439n,1447n,1451n,1453n,1459n,1471n,1481n,1483n,1487n,1489n,1493n,1499n,1511n,1523n,1531n,1543n,1549n,1553n,1559n,1567n,1571n,1579n,1583n,1597n,1601n,1607n,1609n,1613n,1619n,1621n,1627n,1637n,1657n,1663n,1667n,1669n,1693n,1697n,1699n,1709n,1721n,1723n,1733n,1741n,1747n,1753n,1759n,1777n,1783n,1787n,1789n,1801n,1811n,1823n,1831n,1847n,1861n,1867n,1871n,1873n,1877n,1879n,1889n,1901n,1907n,1913n,1931n,1933n,1949n,1951n,1973n,1979n,1987n,1993n,1997n,1999n,2003n,2011n,2017n,2027n,2029n,2039n,2053n,2063n,2069n,2081n,2083n,2087n,2089n,2099n,2111n,2113n,2129n,2131n,2137n,2141n,2143n,2153n,2161n,2179n,2203n,2207n,2213n,2221n,2237n,2239n,2243n,2251n,2267n,2269n,2273n,2281n,2287n,2293n,2297n,2309n,2311n,2333n,2339n,2341n,2347n,2351n,2357n,2371n,2377n,2381n,2383n,2389n,2393n,2399n,2411n,2417n,2423n,2437n,2441n,2447n,2459n,2467n,2473n,2477n,2503n,2521n,2531n,2539n,2543n,2549n,2551n,2557n,2579n,2591n,2593n,2609n,2617n,2621n,2633n,2647n,2657n,2659n,2663n,2671n,2677n,2683n,2687n,2689n,2693n,2699n,2707n,2711n,2713n,2719n,2729n,2731n,2741n,2749n,2753n,2767n,2777n,2789n,2791n,2797n,2801n,2803n,2819n,2833n,2837n,2843n,2851n,2857n,2861n,2879n,2887n,2897n,2903n,2909n,2917n,2927n,2939n,2953n,2957n,2963n,2969n,2971n,2999n,3001n,3011n,3019n,3023n,3037n,3041n,3049n,3061n,3067n,3079n,3083n,3089n,3109n,3119n,3121n,3137n,3163n,3167n,3169n,3181n,3187n,3191n,3203n,3209n,3217n,3221n,3229n,3251n,3253n,3257n,3259n,3271n,3299n,3301n,3307n,3313n,3319n,3323n,3329n,3331n,3343n,3347n,3359n,3361n,3371n,3373n,3389n,3391n,3407n,3413n,3433n,3449n,3457n,3461n,3463n,3467n,3469n,3491n,3499n,3511n,3517n,3527n,3529n,3533n,3539n,3541n,3547n,3557n,3559n,3571n,3581n,3583n,3593n,3607n,3613n,3617n,3623n,3631n,3637n,3643n,3659n,3671n,3673n,3677n,3691n,3697n,3701n,3709n,3719n,3727n,3733n,3739n,3761n,3767n,3769n,3779n,3793n,3797n,3803n,3821n,3823n,3833n,3847n,3851n,3853n,3863n,3877n,3881n,3889n,3907n,3911n,3917n,3919n,3923n,3929n,3931n,3943n,3947n,3967n,3989n,4001n,4003n,4007n,4013n,4019n,4021n,4027n,4049n,4051n,4057n,4073n,4079n,4091n,4093n,4099n,4111n,4127n,4129n,4133n,4139n,4153n,4157n,4159n,4177n,4201n,4211n,4217n,4219n,4229n,4231n,4241n,4243n,4253n,4259n,4261n,4271n,4273n,4283n,4289n,4297n,4327n,4337n,4339n,4349n,4357n,4363n,4373n,4391n,4397n,4409n,4421n,4423n,4441n,4447n,4451n,4457n,4463n,4481n,4483n,4493n,4507n,4513n,4517n,4519n,4523n,4547n,4549n,4561n,4567n,4583n,4591n,4597n,4603n,4621n,4637n,4639n,4643n,4649n,4651n,4657n,4663n,4673n,4679n,4691n,4703n,4721n,4723n,4729n,4733n,4751n,4759n,4783n,4787n,4789n,4793n,4799n,4801n,4813n,4817n,4831n,4861n,4871n,4877n,4889n,4903n,4909n,4919n,4931n,4933n,4937n,4943n,4951n,4957n,4967n,4969n,4973n,4987n,4993n,4999n,5003n];
    let prsz = 670;

    function pollard_rho(N){
        // N is small
        N = BigInt(N);
        for(let i = 0;i < prsz;i++){
            if(N%pri[i] == 0n && N != pri[i]){
                return pri[i];
            }
        }
        let mx_steps = BigInt(Math.floor(Math.pow(Number(N), 0.25) * 3)); 
        
        for(let t = 0 ; t < 50; t++){
            // Floyd
            /*
            let c = rd(1n,N);
            let pl = c;
            let pr = func(c,c,n);
            let gd = 1n;
            let tt = 1n;
            while(gd === 1n && tt <= mx_steps){
                [gd,,] = exgcd(N,abs(pl-pr));
                if(gd > 1n){
                    if(gd == N){
                        break;
                    }else{
                        return gd;
                    }
                }
                pl = func(pl,c,N);
                pr = func(func(pr,c,N),c,N);
                tt++;
            }
            */
            // brent
            let c = rd(1n,N);
            let pl = c;
            let pr = c;
            let gd = 1n;
            let st = 1n;//step
            let cp = 1n;//check point
            let v = 1n;

            while(st < mx_steps){
                cp = st < 128n ? st : 128n;
                let i = 1n;
                let fail = false;
                while(i <= st){
                    pr = func(pr,c,N);
                    v *= abs(pr-pl);
                    v %= N;
                    if(i%cp == 0n){
                        [gd,,] = exgcd(N,v);
                        if(gd > 1n){
                            if(gd == N){
                                fail = true;
                                break;
                            }else{
                                return gd;
                            }
                        }
                    }
                    i += 1n;
                }
                pl = pr;
                st *= 2n;
                v = 1n;
                if(fail){
                    break;
                }
            }
        }
        return 1n;
    }
    if(String(N).length>25){
        return "ERROR:N太大(25位)";
    }
    if(c > N){
        return "ERROR:c太大了吧";
    }
    N = BigInt(N);
    e = BigInt(e);
    c = BigInt(c);
    let p=pollard_rho(N);
    if(p === 1n){
        return "ERROR:N好像是質數";
    }
    let q = N/p;
    if(pollard_rho(p) > 1 || pollard_rho(q) > 1){
        return "ERROR:N是合數"
        //return "Never gonna give you up\nNever gonna let you down\nNever gonna run around and desert you\nNever gonna make you cry\nNever gonna say goodbye\nNever gonna tell a lie and hurt you";
    }
    //console.log(p);
    //console.log(q);
    let phi = (p-1n)*(q-1n);
    if(p == q){
        phi += p-1n;
    }
    let d = fp(e,-1n,phi);
    //console.log(d);
    let m = fp(c,d,N);
    return m;
}

//console.log(rsa_decode(10807,7,1220));
module.exports = { rsa_decode };
