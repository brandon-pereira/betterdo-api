module.exports = (tasks = []) =>
    tasks.reduce(
        (acc, task) => {
            if (task.isCompleted) {
                acc.completeTasks.push(task);
            } else {
                acc.incompleteTasks.push(task);
            }
            return acc;
        },
        {
            incompleteTasks: [],
            completeTasks: []
        }
    );
