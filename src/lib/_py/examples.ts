export const codeExamples: { name: string; code: string }[] = [
    {
        name: '1+1 (no print)',
        code: `1+1`
    },
    {
        name: '1+1 (print)',
        code: `print(1+1)`
    },
    {
        name: 'Multiple statements',
        code: `
1+1
2 * 2
print("The second-to-last one...")
"The last"
        `.trim()
    },
    {
        name: 'Add function',
        code: `
def add(a:float, b:float) -> float:
    return a+b

add(4,4.5)
            `.trim()
    }
];
