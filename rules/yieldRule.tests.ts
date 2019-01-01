import {helper} from './lintRunner';

const rule = 'yield';
const ruleWithReturnType = { name: "yield", options: ["check-return-type"] };
const getFileName = (name) => 'rules/test-data/' + name + '.ts';
const baseCode = `
function getData() {
    return new Promise<ResultData>(() => {});
}

interface ResultData { result: any[] };
`;

describe('yield Rule', () => {
    describe('Void Result', () => {
        it(`shouldn't fail when having void result`, () => {
            const src = baseCode + `
            function* Test() {
                yield getData();
            }`;
            const result = helper({src, rule});
            expect(result.errorCount).toBe(0);
        });
    });
    
    describe('Property Access Expressions', () => {
        it(`should fail when having access to result property`, () => {
            const src = baseCode + `
            function* Test() {
                (yield getData()).result;
            }`;
            const result = helper({src, rule});
            expect(result.errorCount).toBe(1);
        });

        it(`should fail when casting result to any`, () => {
            const src = baseCode + `
            function* Test() {
                ((yield getData()) as any).result;
            }`;
            const result = helper({src, rule});
            expect(result.errorCount).toBe(1);
        });

        it(`shouldn't fail when casting result to custom type`, () => {
            const src = baseCode + `
            function* Test() {
                var a = ((yield getData()) as ResultData);
            }`;
            const result = helper({src, rule});
            expect(result.errorCount).toBe(0);
        });
    });

    describe('Variable Statement', () => {
         it(`should fail when assigning a result`, () => {
             const src = baseCode + `
            function* Test() {
                var result = yield getData();
            }`;
             const result = helper({src, rule});
             expect(result.errorCount).toBe(1);
         });
 
         it(`shouldn't fail when assigning a typed result`, () => {
            const src = baseCode + `
            function* Test() {
                (var result = (yield getData()) as ResultData;
            }`;
             const result = helper({src, rule});
             expect(result.errorCount).toBe(0);
         });
 
         it(`should fail when assigning a result property`, () => {
             const src = baseCode + `
             function* Test() {
                var result = (yield getData()).result;
             }`;
             const result = helper({src, rule});
             expect(result.errorCount).toBe(1);
         });
 
         it(`shouldn't fail when assigning a typed result property`, () => {
             const src = baseCode + `
             function* Test() {
                var result = ((yield getData()) as ResultData).result;
             }`;
             const result = helper({src, rule});
             expect(result.errorCount).toBe(0);
         });
     });
 
     describe('Binary Expression', () => {
         it(`should fail when assigning a result`, () => {
             const src = baseCode + `
             function* Test() {
                var result = null;
                result = yield getData();
             }`;
             const result = helper({src, rule});
             expect(result.errorCount).toBe(1);
         });
 
         it(`shouldn't fail when assigning a typed result`, () => {
             const src = baseCode + `
             function* Test() {
                var result = null;
                result = (yield getData()) as ResultData;
             }`;
             const result = helper({src, rule});
             expect(result.errorCount).toBe(0);
         });
 
         it(`should fail when assigning a result to a property`, () => {
             const src = baseCode + `
             function* Test() {
                var result = { data: null };
                result.data = yield getData();
             }`;
             const result = helper({src, rule});
             expect(result.errorCount).toBe(1);
         });
 
         it(`shouldn't fail when assigning a typed result to a property`, () => {
             const src = baseCode + `
             function* Test() {
                var result = { data: null };
                result.data = (yield getData()) as ResultData;
             }`;
             const result = helper({src, rule});
             expect(result.errorCount).toBe(0);
         });
     });

    describe('Type Checking with check-return-type', () => {
        it(`should fail when having different types`, () => {
            const src = baseCode + `
            function* Test() {
                result.data = (yield getData()) as number;
            }`;
            const result = helper({ src, rule: ruleWithReturnType});
            expect(result.errorCount).toBe(1);
        });

        it(`shouldn't fail when having the same types`, () => {
            const src = baseCode + `
            function* Test() {
                result.data = (yield getData()) as ResultData;
            }`;
            const result = helper({ src, rule: ruleWithReturnType});
            expect(result.errorCount).toBe(0);
        });

        it(`should fail when having wrong yield type`, () => {
            const src = baseCode + `
            function* Test() {
                result.data = (yield number) as number;
            }`;
            const result = helper({ src, rule: ruleWithReturnType});
            expect(result.errorCount).toBe(1);
        });
    });


    describe('Type Checking without check-return-type', () => {
        it(`shouldn't fail when having different types`, () => {
            const src = baseCode + `
            function* Test() {
                result.data = (yield getData()) as number;
            }`;
            const result = helper({ src, rule });
            expect(result.errorCount).toBe(0);
        });

        it(`should fail when having wrong yield type`, () => {
            const src = baseCode + `
            function* Test() {
                result.data = (yield number) as number;
            }`;
            const result = helper({ src, rule });
            expect(result.errorCount).toBe(0);
        });
    });
});
