package com.prostudy.eink.ui.catalog

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.prostudy.eink.R
import com.prostudy.eink.data.model.ProjectSummary

class ProjectAdapter(
    private val onItemClick: (ProjectSummary) -> Unit
) : RecyclerView.Adapter<ProjectAdapter.ViewHolder>() {

    private var items: List<ProjectSummary> = emptyList()

    fun submitList(newItems: List<ProjectSummary>) {
        items = newItems
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_project_card, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    inner class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvNum: TextView = itemView.findViewById(R.id.tv_card_num)
        private val tvTitle: TextView = itemView.findViewById(R.id.tv_card_title)
        private val tvDifficulty: TextView = itemView.findViewById(R.id.tv_card_difficulty)
        private val tvSummary: TextView = itemView.findViewById(R.id.tv_card_summary)
        private val tvConcepts: TextView = itemView.findViewById(R.id.tv_card_concepts)

        fun bind(item: ProjectSummary) {
            val langTag = when (item.lang.lowercase()) {
                "c" -> "C23"
                "go" -> "GO"
                "rust" -> "RUST"
                "python" -> "PY"
                "typescript" -> "TS"
                "javascript" -> "JS"
                else -> item.lang.uppercase()
            }
            tvNum.text = "[$langTag] %02d".format(item.order)
            tvTitle.text = item.title
            val stars = "★".repeat(item.difficulty.coerceIn(1, 5)) +
                    "☆".repeat((5 - item.difficulty).coerceIn(0, 4))
            tvDifficulty.text = stars
            tvSummary.text = item.summary
            tvConcepts.text = item.concepts.joinToString(" ") { "[$it]" }

            itemView.setOnClickListener {
                onItemClick(item)
            }
        }
    }
}
