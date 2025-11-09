pragma circom 2.0.0;

template GreaterEqThan(n) {
    
    
    signal input u;
    signal input v;
    signal output out;
    
    
    signal a[n];  
    signal b[n];  
    signal c[n+1]; 

    
    var sum_a = 0;
    for (var i = 0; i < n; i++) {
        a[i] <-- (u >> i) & 1;  
        a[i] * (a[i] - 1) === 0;  
        sum_a += a[i] * (2 ** i);
    }
    sum_a === u;  
    
    var sum_b = 0;
    for (var i = 0; i < n; i++) {
        b[i] <-- (v >> i) & 1;
        b[i] * (b[i] - 1) === 0;
        sum_b += b[i] * (2 ** i);
    }
    sum_b === v;
    
    
    signal diff;
    diff <== (2 ** n) + u - v;
    
    
    var sum_c = 0;
    for (var i = 0; i <= n; i++) {
        c[i] <-- (diff >> i) & 1;
        c[i] * (c[i] - 1) === 0;
        sum_c += c[i] * (2 ** i);
    }
    sum_c === diff;
    
    out <== c[n];
}
component main = GreaterEqThan(5);