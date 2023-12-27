export const calculateProduceShare = (adoptedTrees) => {
    // The farmer gets 50% of the produce
    const FARMER_SHARE_PERCENTAGE = 50;

    // Filter out trees that don't produce anything
    const productiveTrees = adoptedTrees.filter((adoptedTree) => adoptedTree.tree.produce > 0);

    // Calculate the total produce of all trees
    const totalUserProduce = productiveTrees.reduce((total, adoptedTree) => total + adoptedTree.tree.produce, 0);

    // Calculate the user's share percentage
    let userSharePercentage = (totalUserProduce / 100) * (100 - FARMER_SHARE_PERCENTAGE);

    return {
        userSharePercentage
    };
};


