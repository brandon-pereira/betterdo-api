module.exports = (tasks = []) =>
    tasks.reduce(
        (acc, task) => {
            if (task.isCompleted) {
                acc.completedTasks.push(task);
            } else {
                acc.incompleteTasks.push(task);
            }
            return acc;
        },
        {
            incompleteTasks: [],
            completedTasks: []
        }
    );
