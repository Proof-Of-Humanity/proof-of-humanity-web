const input = [];
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  input.push(chunk);
});
process.stdin.on("end", () => {
  const parsedInput = JSON.parse(input.join(""));
  parsedInput.__schema.types.find(({ name }) => name === "_Schema_").fields = [
    {
      args: [],
      type: {
        kind: "NON_NULL",
        ofType: {
          name: "ID",
        },
      },
    },
  ];
  parsedInput.__schema.types.find(
    ({ name }) => name === "_Schema__orderBy"
  ).enumValues = [{}];
  process.stdout.write(JSON.stringify(parsedInput, null, 2));
  process.stdout.write("\n");
});
