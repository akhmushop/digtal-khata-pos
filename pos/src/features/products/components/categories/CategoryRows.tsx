import { Fragment } from "react/jsx-runtime";
import { CategoryTreeNode } from "./CategoryTreeTable";
import { CategoryRow } from "./CategoryRow";

type CategoryRowsProps = {
  nodes: CategoryTreeNode[];

  level: number;

  expandedIds: Set<number>;

  onToggle: (id: number) => void;

  onEdit: (category: CategoryTreeNode) => void;

  onDelete: (category: CategoryTreeNode) => void;

  onAddChild: (category: CategoryTreeNode) => void;
};

export function CategoryRows({
  nodes,
  level,
  expandedIds,
  onToggle,
  onEdit,
  onDelete,
  onAddChild,
}: CategoryRowsProps) {
  return (
    <>
      {nodes.map((node) => {
        const hasChildren = node.children.length > 0;

        const isExpanded = expandedIds.has(node.id);
        return (
          <Fragment key={node.id}>
            <CategoryRow
              node={node}
              level={level}
              hasChildren={hasChildren}
              isExpanded={isExpanded}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />

            {/* ------------------------------------------------ */}
            {/* CHILDREN */}
            {/* ------------------------------------------------ */}

            {hasChildren && isExpanded && (
              <CategoryRows
                nodes={node.children}
                level={level + 1}
                expandedIds={expandedIds}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChild={onAddChild}
              />
            )}
          </Fragment>
        );
      })}
    </>
  );
}

