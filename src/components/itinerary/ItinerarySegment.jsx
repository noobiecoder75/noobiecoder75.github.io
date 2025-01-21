import { createDraggable, createDroppable } from "@thisbeyond/solid-dnd";
import styles from "./ItinerarySegment.module.css";

function ItinerarySegment(props) {
  const draggable = createDraggable(props.index);
  const droppable = createDroppable(props.index);

  return (
    <div
      use:draggable
      use:droppable
      class={styles.segment}
    >
      <div class={styles.dragHandle}>⋮</div>
      <div class={styles.content}>
        <h4>{props.segment.type}</h4>
        {props.segment.type === 'flight' ? (
          <div class={styles.flightInfo}>
            <span>{props.segment.from} → {props.segment.to}</span>
            <span>{props.segment.date}</span>
          </div>
        ) : (
          <div class={styles.hotelInfo}>
            <span>{props.segment.name}</span>
            <span>{props.segment.checkIn} - {props.segment.checkOut}</span>
          </div>
        )}
        <div class={styles.price}>${props.segment.price}</div>
      </div>
      <button 
        onClick={() => props.onRemove()} 
        class={styles.removeButton}
      >
        ×
      </button>
    </div>
  );
}

export default ItinerarySegment; 